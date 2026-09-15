import { Injectable, Logger } from '@nestjs/common';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

import {
  RESUME_TAILOR_SYSTEM_PROMPT,
  buildResumeTailorUserPrompt,
} from '../prompt/resume-tailor.prompt';
import { AtsAnalyzerTool } from './tools/ats-analyzer.tool';
import { ResumeTailorTool } from './tools/resume-tailor.tool';
import {
  SuggestedSkillItem,
  TailorChangeItem,
  TailoredChangesGroupDto,
} from '../models/resume-tailor.dto';
import { isSkillCoveredByCandidate } from '../utils/skill-aliases';

const flexibleChangeItemSchema = z.union([
  z.string().transform((val) => ({
    title: val,
    description: `Aligned keyword '${val}' with target requirements`,
    impact: 'Improves ATS keyword match and relevance score',
  })),
  z.record(z.any()).transform((obj) => ({
    title: String(obj.title || obj.name || obj.headline || 'Improvement'),
    description: String(obj.description || obj.details || obj.desc || 'Optimized for target job description'),
    impact: String(obj.impact || obj.reason || 'Enhances ATS scannability and recruiter appeal'),
  })),
]);

const flexibleSuggestedSkillSchema = z.union([
  z.string().transform((name) => ({
    name,
    reason: 'Mentioned in job description as a desired capability',
    relevance: 'medium' as const,
  })),
  z.record(z.any()).transform((obj) => {
    const rawRelevance = String(obj.relevance || 'medium').toLowerCase();
    const relevance: 'high' | 'medium' | 'low' =
      rawRelevance === 'high' || rawRelevance === 'low' ? rawRelevance : 'medium';
    return {
      name: String(obj.name || obj.skill || obj.title || ''),
      reason: String(obj.reason || obj.description || 'Desired capability from job description'),
      relevance,
    };
  }),
]);

const resumeTailorZodSchema = z.object({
  tailoredJobTitle: z
    .string()
    .optional()
    .describe('Optimized target professional headline/job title matching the target job description seniority and role, e.g. "Senior Financial Analyst | GAAP, Modeling & Budgeting" or "Senior Software Engineer | Cloud & Distributed Systems"'),
  tailoredSummary: z
    .string()
    .optional()
    .describe('Factually elevated professional summary aligning candidate background with the target role'),
  experienceBullets: z
    .array(
      z.object({
        id: z.string().optional().default('').describe('Original experience entry id'),
        company: z.string().optional().default('').describe('Original company name (must remain identical)'),
        role: z.string().optional().default('').describe('Original job role (must remain identical)'),
        bullets: z.array(z.string()).default([]).describe('Enhanced bullet points with active verbs and JD keywords'),
      }),
    )
    .optional()
    .describe('Enhanced bullet points for work experience entries'),
  projectBullets: z
    .array(
      z.object({
        id: z.string().optional().default('').describe('Original project/custom entry id'),
        heading: z.string().optional().default('').describe('Original project heading (must remain identical)'),
        bullets: z.array(z.string()).default([]).describe('Enhanced bullet points emphasizing target domain competencies, methodologies, and impact'),
      }),
    )
    .optional()
    .describe('Enhanced bullet points or descriptions for project/custom entries'),
  tailoredSkills: z
    .array(z.string())
    .describe('Optimized list of skills (containing candidate skills + user confirmed skills only)'),
  changes: z.object({
    summary: z.array(flexibleChangeItemSchema).optional().default([]).describe('Summary changes'),
    experience: z.array(flexibleChangeItemSchema).optional().default([]).describe('Experience changes'),
    projects: z.array(flexibleChangeItemSchema).optional().default([]).describe('Project changes'),
    keywords: z.array(flexibleChangeItemSchema).optional().default([]).describe('Keyword changes'),
    skills: z.array(flexibleChangeItemSchema).optional().default([]).describe('Skills changes'),
  }),
  suggestedSkills: z
    .array(flexibleSuggestedSkillSchema)
    .optional()
    .default([])
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

  constructor(
    private readonly tailorTool: ResumeTailorTool,
    private readonly analyzerTool: AtsAnalyzerTool,
  ) {}

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

      // 2. Merge experience bullets safely matching entry IDs, company, or role
      if (Array.isArray(result.experienceBullets)) {
        const bulletsMap = new Map<string, string[]>();
        const bulletsByCompanyOrRole = new Map<string, string[]>();
        result.experienceBullets.forEach((item) => {
          if (item && Array.isArray(item.bullets) && item.bullets.length > 0) {
            if (item.id) bulletsMap.set(item.id, item.bullets);
            if (item.company) bulletsByCompanyOrRole.set(item.company.toLowerCase().trim(), item.bullets);
            if (item.role) bulletsByCompanyOrRole.set(item.role.toLowerCase().trim(), item.bullets);
          }
        });

        for (const secId of sectionOrder) {
          const section = sections[secId];
          if (section?.type === 'experience' && Array.isArray(section.data?.entries)) {
            section.data.entries.forEach((entry: any, index: number) => {
              if (bulletsMap.has(entry.id)) {
                entry.bullets = bulletsMap.get(entry.id)!;
              } else if (entry.company && bulletsByCompanyOrRole.has(entry.company.toLowerCase().trim())) {
                entry.bullets = bulletsByCompanyOrRole.get(entry.company.toLowerCase().trim())!;
              } else if (entry.role && bulletsByCompanyOrRole.has(entry.role.toLowerCase().trim())) {
                entry.bullets = bulletsByCompanyOrRole.get(entry.role.toLowerCase().trim())!;
              } else if (result.experienceBullets && result.experienceBullets[index]?.bullets?.length) {
                entry.bullets = result.experienceBullets[index].bullets;
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
          if (
            (section?.type === 'custom' || section?.type === 'projects') &&
            Array.isArray(section.data?.entries)
          ) {
            section.data.entries.forEach((entry: any) => {
              const nameOrHeading = (entry.name || entry.heading || '').toLowerCase().trim();
              if (entry.id && projectById.has(entry.id)) {
                entry.bullets = projectById.get(entry.id)!;
              } else if (nameOrHeading && projectByHeading.has(nameOrHeading)) {
                entry.bullets = projectByHeading.get(nameOrHeading)!;
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
        if (sec?.type === 'projects' && Array.isArray(sec.data?.entries)) {
          sec.data.entries.forEach((p: any) => {
            if (Array.isArray(p.technologies)) {
              allOriginalSkills.push(...p.technologies);
            }
          });
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

      const totalEstimatedSkills = Math.max(
        10,
        (atsContext.matchedSkills?.length || 0) + (atsContext.missingSkills?.length || 0),
      );

      const suggestedSkills: SuggestedSkillItem[] = (result.suggestedSkills || [])
        .filter((sk) => {
          if (!sk?.name || !sk.name.trim()) return false;
          const nameLower = sk.name.toLowerCase().trim();
          if (confirmedSet.has(nameLower)) return false;
          if (isSkillCoveredByCandidate(sk.name, allKnownCandidateSkills)) return false;
          return true;
        })
        .map((sk) => {
          const scoreImpact = this.analyzerTool.calculateSkillMarginalImpact(
            sk.name.trim(),
            totalEstimatedSkills,
            jobDescription,
          );
          return {
            name: sk.name.trim(),
            reason: sk.reason || 'Mentioned in job description as a desired capability',
            relevance: sk.relevance || 'medium',
            scoreImpact,
            status: rejectedSet.has(sk.name.toLowerCase().trim()) ? 'rejected' : 'pending',
          };
        });

      // Supplement from ATS context missing skills & keywords so candidate has complete gap visibility
      const allContextMissing = [
        ...(atsContext.missingSkills || []),
        ...(atsContext.missingKeywords || []),
      ];
      for (const missingItem of allContextMissing) {
        if (!missingItem || !missingItem.trim()) continue;
        const norm = missingItem.toLowerCase().trim();
        if (
          !confirmedSet.has(norm) &&
          !isSkillCoveredByCandidate(missingItem, allKnownCandidateSkills) &&
          !suggestedSkills.some((s) => s.name.toLowerCase() === norm)
        ) {
          const scoreImpact = this.analyzerTool.calculateSkillMarginalImpact(
            missingItem.trim(),
            totalEstimatedSkills,
            jobDescription,
          );
          suggestedSkills.push({
            name: missingItem.trim(),
            reason: 'Identified as a desired competency from target job description',
            relevance: 'high',
            scoreImpact,
            status: rejectedSet.has(norm) ? 'rejected' : 'pending',
          });
        }
      }

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
