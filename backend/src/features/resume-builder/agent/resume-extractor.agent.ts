import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';

import { makeId } from '../../../shared/utils/id.util';
import {
  SectionTypeEnum,
  SectionDto,
} from '../models/resume-section.dto';
import { ResumeStateDto } from '../models/resume-state.dto';
import {
  RESUME_EXTRACTION_SYSTEM_PROMPT,
  buildResumeExtractionUserPrompt,
} from '../prompt/resume-extraction.prompt';

/**
 * Zod Schema for structured LLM extraction output.
 */
const extractedResumeZodSchema = z.object({
  basic: z
    .object({
      name: z.string().describe('Full candidate name'),
      jobTitle: z.string().describe('Job position or current title'),
      email: z.string().describe('Email address'),
      phone: z.string().describe('Phone number'),
      location: z.string().describe('City, State/Country'),
      linkedin: z.string().optional().describe('LinkedIn URL if available'),
      website: z.string().optional().describe('Portfolio or website URL if available'),
    })
    .optional(),
  summary: z
    .object({
      text: z.string().describe('Summary or profile text'),
    })
    .optional(),
  skills: z
    .object({
      categoryLabel: z.string().optional().describe('Label e.g. Skills or Technologies'),
      items: z.array(z.string()).describe('List of skills'),
    })
    .optional(),
  experience: z
    .array(
      z.object({
        company: z.string().describe('Company name'),
        role: z.string().describe('Role/Title'),
        start: z.string().describe('Start date'),
        end: z.string().describe('End date or Present'),
        current: z.boolean().describe('True if currently employed here'),
        bullets: z.array(z.string()).describe('Key achievements and duties'),
      }),
    )
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string().describe('Degree or qualification'),
        field: z.string().describe('Field of study'),
        start: z.string().describe('Start date/year'),
        end: z.string().describe('End date/year'),
      }),
    )
    .optional(),
  certifications: z
    .array(
      z.object({
        name: z.string().describe('Certification name'),
        issuer: z.string().describe('Issuing organization'),
        date: z.string().describe('Issue date'),
        url: z.string().optional().describe('Verification URL if present'),
      }),
    )
    .optional(),
  languages: z
    .array(
      z.object({
        language: z.string().describe('Language name'),
        proficiency: z.string().describe('Proficiency level'),
      }),
    )
    .optional(),
  custom: z
    .array(
      z.object({
        heading: z.string().describe('Section/Project heading'),
        subheading: z.string().optional().describe('Subheading/role'),
        start: z.string().optional().describe('Start date'),
        end: z.string().optional().describe('End date'),
        bullets: z.array(z.string()).describe('Project bullets'),
      }),
    )
    .optional(),
  sectionOrder: z
    .array(z.string())
    .optional()
    .describe('Preferred section order found in resume'),
});

type ExtractedResumeData = z.infer<typeof extractedResumeZodSchema>;

/**
 * LangChain-powered Resume Extractor Agent.
 */
@Injectable()
export class ResumeExtractorAgent {
  /**
   * Processes raw text through LangChain LLM and transforms it into ResumeStateDto.
   *
   * @param {string} resumeText - Raw text extracted from PDF.
   * @returns {Promise<ResumeStateDto>} Normalized resume structure.
   */
  async extractResume(resumeText: string): Promise<ResumeStateDto> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback parser when OPENAI_API_KEY is not set (useful for local dev/testing without LLM key)
      return this.fallbackParse(resumeText);
    }

    try {
      const model = new ChatOpenAI({
        modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.1,
        openAIApiKey: apiKey,
      });

      const structuredLlm = model.withStructuredOutput(extractedResumeZodSchema, {
        name: 'extract_resume_data',
        method: 'functionCalling',
      });

      const result = (await structuredLlm.invoke([
        new SystemMessage(RESUME_EXTRACTION_SYSTEM_PROMPT),
        new HumanMessage(buildResumeExtractionUserPrompt(resumeText)),
      ])) as ExtractedResumeData;

      return this.transformToResumeState(result);
    } catch (error) {
      throw new InternalServerErrorException(
        `Resume extraction agent failed: ${error instanceof Error ? error.message : 'Unknown LLM error'}`,
      );
    }
  }

  /**
   * Transforms the extracted structured data into the frontend ResumeStateDto.
   *
   * @private
   * @param {ExtractedResumeData} data - LLM extracted data.
   * @returns {ResumeStateDto}
   */
  private transformToResumeState(data: ExtractedResumeData): ResumeStateDto {
    const cleanStr = (s?: string) => (s ? s.replace(/\s+/g, ' ').trim() : '');
    const sections: Record<string, SectionDto> = {};
    const sectionOrder: string[] = [];

    // Basic Info
    if (data.basic && (data.basic.name || data.basic.email || data.basic.jobTitle)) {
      const id = makeId('section');
      sections[id] = {
        id,
        type: SectionTypeEnum.BASIC,
        title: 'Personal Info',
        visible: true,
        data: {
          name: cleanStr(data.basic.name),
          jobTitle: cleanStr(data.basic.jobTitle),
          email: cleanStr(data.basic.email),
          phone: cleanStr(data.basic.phone),
          location: cleanStr(data.basic.location),
          linkedin: cleanStr(data.basic.linkedin),
          website: cleanStr(data.basic.website),
        },
      };
      sectionOrder.push(id);
    }

    // Summary
    if (data.summary && data.summary.text) {
      const id = makeId('section');
      sections[id] = {
        id,
        type: SectionTypeEnum.SUMMARY,
        title: 'Summary',
        visible: true,
        data: {
          text: cleanStr(data.summary.text),
        },
      };
      sectionOrder.push(id);
    }

    // Experience
    if (data.experience && data.experience.length > 0) {
      const validExperience = data.experience.filter((entry) => {
        const company = cleanStr(entry.company);
        const role = cleanStr(entry.role);
        // Exclude empty entries or degrees mistakenly parsed into experience
        if (!company && !role) return false;
        if (/^(bachelor|master|b\.com|m\.com|b\.sc|m\.sc|b\.tech|m\.tech|phd|diploma|degree)/i.test(role) && !company) {
          return false;
        }
        if (/^(bachelor|master|b\.com|m\.com|b\.sc|m\.sc|b\.tech|m\.tech|phd|diploma|degree)/i.test(company) && (!entry.bullets || entry.bullets.length === 0)) {
          return false;
        }
        return true;
      });

      if (validExperience.length > 0) {
        const id = makeId('section');
        sections[id] = {
          id,
          type: SectionTypeEnum.EXPERIENCE,
          title: 'Experience',
          visible: true,
          data: {
            entries: validExperience.map((entry) => ({
              id: makeId('entry'),
              company: cleanStr(entry.company),
              role: cleanStr(entry.role),
              start: cleanStr(entry.start),
              end: cleanStr(entry.end),
              current: entry.current ?? false,
              bullets: (entry.bullets || []).map((b) => cleanStr(b)).filter((b) => b.length > 0),
            })),
          },
        };
        sectionOrder.push(id);
      }
    }

    // Education
    if (data.education && data.education.length > 0) {
      const id = makeId('section');
      sections[id] = {
        id,
        type: SectionTypeEnum.EDUCATION,
        title: 'Education',
        visible: true,
        data: {
          entries: data.education.map((entry) => ({
            id: makeId('entry'),
            degree: cleanStr(entry.degree),
            field: cleanStr(entry.field),
            start: cleanStr(entry.start),
            end: cleanStr(entry.end),
          })),
        },
      };
      sectionOrder.push(id);
    }

    // Skills
    if (data.skills && data.skills.items && data.skills.items.length > 0) {
      const id = makeId('section');
      sections[id] = {
        id,
        type: SectionTypeEnum.SKILLS,
        title: 'Skills',
        visible: true,
        data: {
          categoryLabel: data.skills.categoryLabel || 'Technical Skills',
          items: data.skills.items,
        },
      };
      sectionOrder.push(id);
    }

    // Certifications
    if (data.certifications && data.certifications.length > 0) {
      const id = makeId('section');
      sections[id] = {
        id,
        type: SectionTypeEnum.CERTIFICATIONS,
        title: 'Certifications',
        visible: true,
        data: {
          entries: data.certifications.map((entry) => ({
            id: makeId('entry'),
            name: entry.name || '',
            issuer: entry.issuer || '',
            date: entry.date || '',
            url: entry.url || '',
          })),
        },
      };
      sectionOrder.push(id);
    }

    // Languages
    if (data.languages && data.languages.length > 0) {
      const id = makeId('section');
      sections[id] = {
        id,
        type: SectionTypeEnum.LANGUAGES,
        title: 'Languages',
        visible: true,
        data: {
          entries: data.languages.map((entry) => ({
            id: makeId('entry'),
            language: entry.language || '',
            proficiency: entry.proficiency || '',
          })),
        },
      };
      sectionOrder.push(id);
    }

    // Custom
    if (data.custom && data.custom.length > 0) {
      const id = makeId('section');
      sections[id] = {
        id,
        type: SectionTypeEnum.CUSTOM,
        title: 'Projects & Activities',
        visible: true,
        data: {
          entries: data.custom.map((entry) => ({
            id: makeId('entry'),
            heading: entry.heading || '',
            subheading: entry.subheading || '',
            start: entry.start || '',
            end: entry.end || '',
            bullets: entry.bullets || [],
          })),
        },
      };
      sectionOrder.push(id);
    }

    return {
      sectionOrder,
      sections,
    };
  }

  /**
   * Fallback heuristic parser when no OpenAI API key is configured.
   *
   * @private
   * @param {string} text - Raw resume text.
   * @returns {ResumeStateDto}
   */
  private fallbackParse(text: string): ResumeStateDto {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Extract cleaner email by matching standard email patterns and stripping any leading numeric artifacts
    const rawEmailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const email = rawEmailMatch ? rawEmailMatch[1] : '';

    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w.-]+/i);

    // Try finding location from contact lines (e.g. city, state)
    let location = '';
    const contactLine = lines.find((l) => l.includes(',') && !l.includes('@') && !l.includes('http'));
    if (contactLine && contactLine.length < 50) {
      location = contactLine;
    }

    const name = lines[0] || 'Extracted Candidate';
    const jobTitle = lines[1] && !lines[1].includes('@') && !lines[1].includes('+') ? lines[1] : '';

    const sections: Record<string, SectionDto> = {};
    const sectionOrder: string[] = [];

    // Basic Info
    const basicId = makeId('section');
    sections[basicId] = {
      id: basicId,
      type: SectionTypeEnum.BASIC,
      title: 'Personal Info',
      visible: true,
      data: {
        name,
        jobTitle,
        email,
        phone: phoneMatch ? phoneMatch[0] : '',
        location,
        linkedin: linkedinMatch ? linkedinMatch[0] : '',
        website: '',
      },
    };
    sectionOrder.push(basicId);

    // Extract summary/about if present
    const aboutIdx = lines.findIndex((l) => /^(about me|summary|professional summary|profile)/i.test(l));
    if (aboutIdx !== -1) {
      const summaryLines: string[] = [];
      for (let i = aboutIdx + 1; i < lines.length && i < aboutIdx + 6; i++) {
        if (/^(education|work experience|experience|skills)/i.test(lines[i])) break;
        summaryLines.push(lines[i]);
      }
      if (summaryLines.length > 0) {
        const summaryId = makeId('section');
        sections[summaryId] = {
          id: summaryId,
          type: SectionTypeEnum.SUMMARY,
          title: 'Summary',
          visible: true,
          data: {
            text: summaryLines.join(' '),
          },
        };
        sectionOrder.push(summaryId);
      }
    }

    return {
      sectionOrder,
      sections,
    };
  }
}
