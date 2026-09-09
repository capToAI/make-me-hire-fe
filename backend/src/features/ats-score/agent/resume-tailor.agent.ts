import { Injectable, Logger } from '@nestjs/common';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

import {
  RESUME_TAILOR_SYSTEM_PROMPT,
  buildResumeTailorUserPrompt,
} from '../prompt/resume-tailor.prompt';
import { ResumeTailorTool } from './tools/resume-tailor.tool';
import {
  SuggestedSkillItem,
  TailorChangeItem,
  TailoredChangesGroupDto,
} from '../models/resume-tailor.dto';
import { isSkillCoveredByCandidate } from '../utils/skill-aliases';

const changeItemSchema = z.object({
  title: z.string().describe('Short headline of change made'),
  description: z.string().describe('Detailed explanation of the change'),
  impact: z.string().describe('Why this change improves ATS compatibility or recruiter reception'),
});

const resumeTailorZodSchema = z.object({
  tailoredJobTitle: z
    .string()
    .optional()
    .describe('Optimized target professional headline/job title matching the target job description seniority and role, e.g. "Senior Angular Developer | TypeScript, RxJS & NgRx"'),
  tailoredSummary: z
    .string()
    .optional()
    .describe('Factually elevated professional summary aligning candidate background with the target role'),
  experienceBullets: z
    .array(
      z.object({
        id: z.string().describe('Original experience entry id'),
        company: z.string().describe('Original company name (must remain identical)'),
        role: z.string().describe('Original job role (must remain identical)'),
        bullets: z.array(z.string()).describe('Enhanced bullet points with active verbs and JD keywords'),
      }),
    )
    .optional()
    .describe('Enhanced bullet points for work experience entries'),
  projectBullets: z
    .array(
      z.object({
        id: z.string().describe('Original project/custom entry id'),
        heading: z.string().describe('Original project heading (must remain identical)'),
        bullets: z.array(z.string()).describe('Enhanced bullet points emphasizing target tech stack and impact'),
      }),
    )
    .optional()
    .describe('Enhanced bullet points or descriptions for project/custom entries'),
  tailoredSkills: z
    .array(z.string())
    .describe('Optimized list of skills (containing candidate skills + user confirmed skills only)'),
  changes: z.object({
    summary: z.array(changeItemSchema).describe('Summary changes'),
    experience: z.array(changeItemSchema).describe('Experience changes'),
    projects: z.array(changeItemSchema).optional().describe('Project changes'),
    keywords: z.array(changeItemSchema).describe('Keyword changes'),
    skills: z.array(changeItemSchema).describe('Skills changes'),
  }),
  suggestedSkills: z
    .array(
      z.object({
        name: z.string().describe('Missing skill name from job description'),
        reason: z.string().describe('Why this skill is recommended based on the job description'),
        relevance: z.enum(['high', 'medium', 'low']).describe('Skill criticality for this role'),
      }),
    )
    .describe('Skills required by the job description but not in candidate resume (requiring confirmation)'),
});

export type ResumeTailorLlmOutput = z.infer<typeof resumeTailorZodSchema>;

export interface TailoredAgentResult {
  tailoredResumeData: Record<string, any>;
  changes: TailoredChangesGroupDto;
  suggestedSkills: SuggestedSkillItem[];
}

@Injectable()
export class ResumeTailorAgent {
  private readonly logger = new Logger(ResumeTailorAgent.name);

  constructor(private readonly tailorTool: ResumeTailorTool) {}

  /**
   * Tailors a candidate's resume for a job description using LLM with deterministic fallback.
   */
  async tailorResume(
    originalResumeData: Record<string, any>,
    jobDescription: string,
    atsContext: {
      matchedKeywords?: string[];
      missingKeywords?: string[];
      matchedSkills?: string[];
      missingSkills?: string[];
    },
    confirmedSkills: string[] = [],
    rejectedSkills: string[] = [],
  ): Promise<TailoredAgentResult> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY not found. Tailoring resume using deterministic heuristic engine.',
      );
      return this.tailorTool.tailorDeterministically(
        originalResumeData,
        jobDescription,
        confirmedSkills,
        rejectedSkills,
      );
    }

    try {
      this.logger.log(
        `Invoking AI Resume Tailoring Agent for job description (${jobDescription.length} chars)`,
      );

      const model = new ChatOpenAI({
        modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        openAIApiKey: apiKey,
      });

      const structuredLlm = model.withStructuredOutput(resumeTailorZodSchema, {
        name: 'tailored_resume_generation',
        method: 'functionCalling',
      });

      const allMatchedKeywords = Array.from(
        new Set([
          ...(atsContext.matchedSkills || []),
          ...(atsContext.matchedKeywords || []),
        ]),
      );
      const allMissingKeywords = Array.from(
        new Set([
          ...(atsContext.missingSkills || []),
          ...(atsContext.missingKeywords || []),
        ]),
      );

      const userPrompt = buildResumeTailorUserPrompt(
        JSON.stringify(originalResumeData, null, 2),
        jobDescription,
        allMatchedKeywords,
        allMissingKeywords,
        confirmedSkills,
      );

      const result = (await structuredLlm.invoke([
        new SystemMessage(RESUME_TAILOR_SYSTEM_PROMPT),
        new HumanMessage(userPrompt),
      ])) as ResumeTailorLlmOutput;

      if (!result || !result.changes) {
        throw new Error('LLM returned an invalid tailoring payload');
      }

      // Merge AI outputs safely into a deep copy of original data
      const tailoredResumeData = this.tailorTool.deepClone(originalResumeData);
      const sections = tailoredResumeData.sections || {};
      const sectionOrder: string[] = Array.isArray(tailoredResumeData.sectionOrder)
        ? tailoredResumeData.sectionOrder
        : Object.keys(sections);

      // 0. Merge tailoredJobTitle if available
      let headlineChanged = false;
      let previousHeadline = '';
      if (result.tailoredJobTitle && result.tailoredJobTitle.trim()) {
        for (const secId of sectionOrder) {
          const section = sections[secId];
          if (section?.type === 'basic' && section.data) {
            previousHeadline = section.data.jobTitle || '';
            section.data.jobTitle = result.tailoredJobTitle.trim();
            headlineChanged = true;
          }
        }
      }

      // 1. Merge summary if available
      if (result.tailoredSummary) {
        for (const secId of sectionOrder) {
          const section = sections[secId];
          if (section?.type === 'summary' && section.data) {
            section.data.text = result.tailoredSummary.trim();
          }
        }
      }

      // 2. Merge experience bullets safely matching entry IDs
      if (Array.isArray(result.experienceBullets)) {
        const bulletsMap = new Map<string, string[]>();
        result.experienceBullets.forEach((item) => {
          if (item.id && Array.isArray(item.bullets) && item.bullets.length > 0) {
            bulletsMap.set(item.id, item.bullets);
          }
        });

        for (const secId of sectionOrder) {
          const section = sections[secId];
          if (section?.type === 'experience' && Array.isArray(section.data?.entries)) {
            section.data.entries.forEach((entry: any) => {
              if (bulletsMap.has(entry.id)) {
                entry.bullets = bulletsMap.get(entry.id)!;
              }
            });
          }
        }
      }

      // 3. Merge project / custom bullets safely matching entry IDs or headings
      if (Array.isArray(result.projectBullets) && result.projectBullets.length > 0) {
        const projectById = new Map<string, string[]>();
        const projectByHeading = new Map<string, string[]>();

        result.projectBullets.forEach((item) => {
          if (Array.isArray(item.bullets) && item.bullets.length > 0) {
            if (item.id) {
              projectById.set(item.id, item.bullets);
            }
            if (item.heading) {
              projectByHeading.set(item.heading.toLowerCase().trim(), item.bullets);
            }
          }
        });

        for (const secId of sectionOrder) {
          const section = sections[secId];
          if (section?.type === 'custom' && Array.isArray(section.data?.entries)) {
            section.data.entries.forEach((entry: any) => {
              if (entry.id && projectById.has(entry.id)) {
                entry.bullets = projectById.get(entry.id)!;
              } else if (entry.heading && projectByHeading.has(entry.heading.toLowerCase().trim())) {
                entry.bullets = projectByHeading.get(entry.heading.toLowerCase().trim())!;
              }
            });
          }
        }
      }

      // Collect all candidate original skills from all sections
      const allOriginalSkills: string[] = [];
      Object.values(originalResumeData.sections || {}).forEach((sec: any) => {
        if (sec?.type === 'skills' && Array.isArray(sec.data?.items)) {
          allOriginalSkills.push(...sec.data.items);
        }
      });
      const allKnownCandidateSkills = [...allOriginalSkills, ...confirmedSkills];

      // 3. Merge skills safely: candidate skills (including recognized synonyms) + confirmed skills only
      if (Array.isArray(result.tailoredSkills) && result.tailoredSkills.length > 0) {
        for (const secId of sectionOrder) {
          const section = sections[secId];
          if (section?.type === 'skills' && section.data) {
            // Guarantee factual check: only allow skills that were either in original, confirmed, or equivalent aliases
            const originalSkills = new Set<string>();
            const origSec = originalResumeData.sections?.[secId];
            if (Array.isArray(origSec?.data?.items)) {
              origSec.data.items.forEach((s: string) => originalSkills.add(s.toLowerCase()));
            }
            const confirmedLower = new Set(confirmedSkills.map((s) => s.toLowerCase()));

            const verifiedSkills: string[] = [];
            result.tailoredSkills.forEach((skill) => {
              const lower = skill.toLowerCase();
              if (
                originalSkills.has(lower) ||
                confirmedLower.has(lower) ||
                isSkillCoveredByCandidate(skill, allKnownCandidateSkills)
              ) {
                verifiedSkills.push(skill);
              }
            });

            // Make sure all confirmedSkills are present
            confirmedSkills.forEach((cs) => {
              if (!verifiedSkills.some((vs) => vs.toLowerCase() === cs.toLowerCase())) {
                verifiedSkills.push(cs);
              }
            });

            section.data.items = verifiedSkills.length > 0 ? verifiedSkills : section.data.items;
          }
        }
      }

      // 4. Map suggested skills (strictly exclude any skill the candidate already possesses or has alias of)
      const rejectedSet = new Set(rejectedSkills.map((s) => s.toLowerCase()));
      const confirmedSet = new Set(confirmedSkills.map((s) => s.toLowerCase()));

      const suggestedSkills: SuggestedSkillItem[] = (result.suggestedSkills || [])
        .filter((sk) => {
          const nameLower = sk.name.toLowerCase();
          if (confirmedSet.has(nameLower)) return false;
          if (isSkillCoveredByCandidate(sk.name, allKnownCandidateSkills)) return false;
          return true;
        })
        .map((sk) => ({
          name: sk.name,
          reason: sk.reason,
          relevance: sk.relevance,
          status: rejectedSet.has(sk.name.toLowerCase()) ? 'rejected' : 'pending',
        }));

      const mapChanges = (items?: any[]): TailorChangeItem[] => {
        if (!Array.isArray(items)) return [];
        return items.map((item) => ({
          title: String(item?.title || 'Improvement'),
          description: String(item?.description || ''),
          impact: String(item?.impact || 'Enhances ATS compatibility'),
        }));
      };

      const summaryChanges = mapChanges(result.changes?.summary);
      if (headlineChanged && result.tailoredJobTitle) {
        summaryChanges.unshift({
          title: 'Target Professional Headline Alignment',
          description: `Aligned professional title from "${previousHeadline || 'General'}" to "${result.tailoredJobTitle.trim()}".`,
          impact: 'Directly secures title-alignment match points (+10 pts) in ATS screening algorithms.',
        });
      }

      return {
        tailoredResumeData,
        changes: {
          summary: summaryChanges,
          experience: mapChanges(result.changes?.experience),
          projects: mapChanges(result.changes?.projects),
          keywords: mapChanges(result.changes?.keywords),
          skills: mapChanges(result.changes?.skills),
        },
        suggestedSkills,
      };
    } catch (error) {
      this.logger.error(
        `AI Resume Tailoring failed: ${error instanceof Error ? error.message : 'Unknown error'}. Falling back to deterministic tailoring.`,
      );
      return this.tailorTool.tailorDeterministically(
        originalResumeData,
        jobDescription,
        confirmedSkills,
        rejectedSkills,
      );
    }
  }
}
