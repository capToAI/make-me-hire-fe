import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

import { SectionTypeEnum } from '../../models/resume-section.dto';

const sectionClassifierSchema = z.object({
  heading: z
    .string()
    .describe('The raw section header or title found in the resume (e.g., "Work History", "Selected Projects")'),
});

/**
 * Tool for classifying unstructured resume section headers into standard SectionTypeEnum values.
 */
export const sectionClassifierTool: DynamicStructuredTool<any, any, any, any> =
  new DynamicStructuredTool({
  name: 'classify_resume_section',
  description:
    'Determines the standard resume section type based on an unstructured section heading found in the resume.',
  schema: sectionClassifierSchema,
  func: async ({ heading }: { heading: string }): Promise<string> => {
    const lower = heading.toLowerCase().trim();

    if (lower.includes('contact') || lower.includes('personal') || lower.includes('info')) {
      return SectionTypeEnum.BASIC;
    }
    if (lower.includes('summary') || lower.includes('profile') || lower.includes('objective') || lower.includes('about')) {
      return SectionTypeEnum.SUMMARY;
    }
    if (lower.includes('skill') || lower.includes('technologies') || lower.includes('competencies') || lower.includes('tech stack')) {
      return SectionTypeEnum.SKILLS;
    }
    if (lower.includes('experience') || lower.includes('employment') || lower.includes('work') || lower.includes('career')) {
      return SectionTypeEnum.EXPERIENCE;
    }
    if (lower.includes('education') || lower.includes('academic') || lower.includes('degree') || lower.includes('school')) {
      return SectionTypeEnum.EDUCATION;
    }
    if (lower.includes('certif') || lower.includes('license') || lower.includes('credential') || lower.includes('courses')) {
      return SectionTypeEnum.CERTIFICATIONS;
    }
    if (lower.includes('language') || lower.includes('linguistic')) {
      return SectionTypeEnum.LANGUAGES;
    }

    return SectionTypeEnum.CUSTOM;
  },
});

