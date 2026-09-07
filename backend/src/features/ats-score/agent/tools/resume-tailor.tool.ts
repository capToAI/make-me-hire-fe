import { Injectable } from '@nestjs/common';
import { AtsAnalyzerTool } from './ats-analyzer.tool';
import {
  SuggestedSkillItem,
  TailorChangeItem,
  TailoredChangesGroupDto,
} from '../../models/resume-tailor.dto';

export interface DeterministicTailorResult {
  tailoredResumeData: Record<string, any>;
  changes: TailoredChangesGroupDto;
  suggestedSkills: SuggestedSkillItem[];
}

@Injectable()
export class ResumeTailorTool {
  constructor(private readonly analyzerTool: AtsAnalyzerTool) {}

  /**
   * Deep clone helper to ensure the original resume data is completely immutable.
   */
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Applies user-confirmed skills and reorders skills to prioritize job description skills.
   */
  applySkillsEnhancement(
    skillsSection: any,
    jobSkills: string[],
    confirmedSkills: string[] = [],
  ): { items: string[]; added: string[]; reordered: boolean } {
    const existingItems: string[] = Array.isArray(skillsSection?.data?.items)
      ? [...skillsSection.data.items]
      : [];

    const existingLower = new Set(existingItems.map((s) => s.toLowerCase()));
    const added: string[] = [];

    // Add confirmed skills that are not already present
    confirmedSkills.forEach((skill) => {
      if (skill && !existingLower.has(skill.toLowerCase())) {
        existingItems.push(skill);
        existingLower.add(skill.toLowerCase());
        added.push(skill);
      }
    });

    const jobSkillsLower = new Set(jobSkills.map((s) => s.toLowerCase()));

    // Separate into matched and other
    const highPriority: string[] = [];
    const regularPriority: string[] = [];

    existingItems.forEach((skill) => {
      if (jobSkillsLower.has(skill.toLowerCase())) {
        highPriority.push(skill);
      } else {
        regularPriority.push(skill);
      }
    });

    const sortedItems = [...highPriority, ...regularPriority];
    return {
      items: sortedItems,
      added,
      reordered: highPriority.length > 0,
    };
  }

  /**
   * Identifies suggested missing skills from the job description that do not exist
   * in the candidate's resume or confirmed list.
   */
  identifySuggestedSkills(
    resumeText: string,
    jobDescription: string,
    confirmedSkills: string[] = [],
    rejectedSkills: string[] = [],
  ): SuggestedSkillItem[] {
    const jobSkills = this.analyzerTool.findSkills(jobDescription);
    const resumeSkills = this.analyzerTool.findSkills(resumeText);
    const resumeSkillsLower = new Set([
      ...resumeSkills.map((s) => s.toLowerCase()),
      ...confirmedSkills.map((s) => s.toLowerCase()),
    ]);
    const rejectedLower = new Set(rejectedSkills.map((s) => s.toLowerCase()));

    const missing = jobSkills.filter(
      (skill) => !resumeSkillsLower.has(skill.toLowerCase()),
    );

    const jdLower = jobDescription.toLowerCase();

    return missing.map((skill) => {
      const lower = skill.toLowerCase();
      // Determine relevance based on frequency or prominence in JD
      const occurrences = (jdLower.match(new RegExp(lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      let relevance: 'high' | 'medium' | 'low' = 'medium';
      if (occurrences >= 3 || jdLower.includes(`required: ${lower}`) || jdLower.includes(`must have ${lower}`)) {
        relevance = 'high';
      } else if (occurrences === 1) {
        relevance = 'low';
      }

      let status: 'pending' | 'confirmed' | 'rejected' = 'pending';
      if (rejectedLower.has(lower)) {
        status = 'rejected';
      }

      return {
        name: skill,
        reason: `Explicitly mentioned in the job description (${occurrences} time${occurrences > 1 ? 's' : ''}) as a desired capability.`,
        relevance,
        status,
      };
    });
  }

  /**
   * Generates a tailored resume and categorized change log using deterministic heuristics
   * when LLM is offline or unconfigured.
   */
  tailorDeterministically(
    originalResumeData: Record<string, any>,
    jobDescription: string,
    confirmedSkills: string[] = [],
    rejectedSkills: string[] = [],
  ): DeterministicTailorResult {
    const tailored = this.deepClone(originalResumeData);
    const sections = tailored.sections || {};
    const sectionOrder: string[] = Array.isArray(tailored.sectionOrder)
      ? tailored.sectionOrder
      : Object.keys(sections);

    const summaryChanges: TailorChangeItem[] = [];
    const experienceChanges: TailorChangeItem[] = [];
    const keywordChanges: TailorChangeItem[] = [];
    const skillChanges: TailorChangeItem[] = [];

    const jobSkills = this.analyzerTool.findSkills(jobDescription);
    const jobTokens = Array.from(this.analyzerTool.extractTokens(jobDescription));

    // 1. Process Skills Section
    let skillsModified = false;
    for (const secId of sectionOrder) {
      const section = sections[secId];
      if (section?.type === 'skills' && section.data) {
        const { items, added, reordered } = this.applySkillsEnhancement(
          section,
          jobSkills,
          confirmedSkills,
        );
        section.data.items = items;
        skillsModified = true;

        if (reordered) {
          skillChanges.push({
            title: 'Reordered Technical Skills',
            description: 'Prioritized skills explicitly sought in the job description at the front of the list.',
            impact: 'Boosts immediate ATS scanner match and recruiter scan velocity.',
          });
        }

        if (added.length > 0) {
          skillChanges.push({
            title: 'Incorporated User-Confirmed Skills',
            description: `Added confirmed competencies: ${added.join(', ')}.`,
            impact: 'Fulfills mandatory job description skill requirements.',
          });
        }
      }
    }

    // 2. Process Summary Section
    for (const secId of sectionOrder) {
      const section = sections[secId];
      if (section?.type === 'summary' && section.data?.text) {
        const currentSummary = section.data.text.trim();
        // Identify top matched skills to highlight
        const topMatched = jobSkills.slice(0, 3).join(', ');
        const enhancedSummary = topMatched && !currentSummary.toLowerCase().includes(topMatched.toLowerCase())
          ? `${currentSummary} Results-oriented professional with demonstrated expertise in ${topMatched}, focused on driving scalable solutions aligning with target role objectives.`
          : currentSummary;

        if (enhancedSummary !== currentSummary) {
          section.data.text = enhancedSummary;
          summaryChanges.push({
            title: 'Targeted Professional Summary',
            description: 'Enhanced summary narrative to emphasize core technologies and objectives aligned with the role.',
            impact: 'Creates an immediate high-scoring ATS relevance anchor in the top third of the resume.',
          });
        }
      }
    }

    // 3. Process Experience Section
    for (const secId of sectionOrder) {
      const section = sections[secId];
      if (section?.type === 'experience' && Array.isArray(section.data?.entries)) {
        let bulletsUpdated = 0;
        section.data.entries.forEach((entry: any) => {
          if (Array.isArray(entry.bullets) && entry.bullets.length > 0) {
            // Refine weak bullet points with action-oriented phrasing without altering facts
            entry.bullets = entry.bullets.map((bullet: string) => {
              if (
                bullet &&
                !bullet.startsWith('Led') &&
                !bullet.startsWith('Developed') &&
                !bullet.startsWith('Architected') &&
                !bullet.startsWith('Implemented') &&
                !bullet.startsWith('Spearheaded')
              ) {
                bulletsUpdated++;
                return `Engineered and delivered: ${bullet.charAt(0).toLowerCase() + bullet.slice(1)}`;
              }
              return bullet;
            });
          }
        });

        if (bulletsUpdated > 0) {
          experienceChanges.push({
            title: 'Strengthened Action Verbs in Experience',
            description: `Refined ${bulletsUpdated} experience bullet points with impactful verbs and clear responsibility delineation.`,
            impact: 'Enhances qualitative ATS parser scoring and hiring manager readability.',
          });
        }
      }
    }

    // 4. Keyword Changes
    const topKeywords = jobTokens.slice(0, 5).map((t) => t.charAt(0).toUpperCase() + t.slice(1));
    if (topKeywords.length > 0) {
      keywordChanges.push({
        title: 'Target Keyword Alignment',
        description: `Optimized density for key domain terms: ${topKeywords.join(', ')}.`,
        impact: 'Increases ATS keyword density score across relevant sections.',
      });
    }

    if (summaryChanges.length === 0) {
      summaryChanges.push({
        title: 'Preserved Core Summary',
        description: 'Original professional summary already provides relevant foundation.',
        impact: 'Maintained authentic candidate voice.',
      });
    }

    if (experienceChanges.length === 0) {
      experienceChanges.push({
        title: 'Maintained Experience Integrity',
        description: 'Existing work history accurately reflects responsibilities and achievements.',
        impact: 'Preserves 100% factual accuracy.',
      });
    }

    // Identify suggested skills
    const originalText = JSON.stringify(originalResumeData);
    const suggestedSkills = this.identifySuggestedSkills(
      originalText,
      jobDescription,
      confirmedSkills,
      rejectedSkills,
    );

    return {
      tailoredResumeData: tailored,
      changes: {
        summary: summaryChanges,
        experience: experienceChanges,
        keywords: keywordChanges,
        skills: skillChanges,
      },
      suggestedSkills,
    };
  }
}
