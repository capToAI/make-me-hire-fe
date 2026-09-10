import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

import {
  SUMMARY_REFINEMENT_SYSTEM_PROMPT,
  buildSummaryRefinementUserPrompt,
} from '../prompt/summary-refinement.prompt';

/**
 * Zod schema defining the expected structured response from the LLM for summary refinement.
 */
const refinedSummaryZodSchema = z.object({
  refinedSummary: z
    .string()
    .describe('The elevated, polished resume summary text optimized for recruitment review'),
});

type RefinedSummaryData = z.infer<typeof refinedSummaryZodSchema>;

/**
 * LangChain-powered AI Agent dedicated to refining professional resume summaries.
 */
@Injectable()
export class SummaryRefinerAgent {
  private readonly logger = new Logger(SummaryRefinerAgent.name);

  /**
   * Refines a candidate resume summary using OpenAI LLM or deterministic fallback.
   *
   * @param {string} summary - Original resume summary content.
   * @returns {Promise<string>} Polished resume summary text.
   */
  async refineSummary(summary: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured. Utilizing deterministic heuristic summary refiner.');
      return this.fallbackRefine(summary);
    }

    try {
      this.logger.log(`Invoking AI summary refinement agent for ${summary.length} character summary`);
      const model = new ChatOpenAI({
        modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        openAIApiKey: apiKey,
      });

      const structuredLlm = model.withStructuredOutput(refinedSummaryZodSchema, {
        name: 'refine_resume_summary',
        method: 'functionCalling',
      });

      const result = (await structuredLlm.invoke([
        new SystemMessage(SUMMARY_REFINEMENT_SYSTEM_PROMPT),
        new HumanMessage(buildSummaryRefinementUserPrompt(summary)),
      ])) as RefinedSummaryData;

      if (!result || !result.refinedSummary || !result.refinedSummary.trim()) {
        throw new Error('LLM returned an empty or invalid summary refinement.');
      }

      return result.refinedSummary.trim();
    } catch (error) {
      this.logger.error(
        `Summary refinement agent error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new InternalServerErrorException(
        `AI Summary Refinement failed: ${error instanceof Error ? error.message : 'Unknown LLM failure'}`,
      );
    }
  }

  /**
   * Deterministic heuristic fallback when an OpenAI API key is unavailable.
   * Cleans punctuation, normalizes spacing, and formats phrasing while preserving all original text.
   *
   * @param {string} text - Raw input text.
   * @returns {string} Cleaned and normalized text.
   */
  fallbackRefine(text: string): string {
    const cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) {
      return '';
    }

    // Capitalize first letter if needed
    const formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

    // Ensure terminal period
    if (!/[.!?]$/.test(formatted)) {
      return `${formatted}.`;
    }

    return formatted;
  }

  /**
   * Refines draft project bullet points using OpenAI LLM or deterministic fallback.
   *
   * @param {string | undefined} projectName - Optional name of the project.
   * @param {string[] | undefined} technologies - Technologies used in the project.
   * @param {string[]} bullets - Original bullet points.
   * @returns {Promise<string[]>} Array of elevated bullet points with action verbs and bold terms.
   */
  async refineProjectBullets(
    projectName?: string,
    technologies?: string[],
    bullets: string[] = [],
  ): Promise<string[]> {
    const validBullets = bullets.filter((b) => b && b.trim().length > 0);
    if (validBullets.length === 0) {
      return [];
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY not configured. Utilizing deterministic heuristic project bullets refiner.',
      );
      return this.fallbackRefineBullets(validBullets, technologies);
    }

    try {
      this.logger.log(
        `Invoking AI project bullets refinement agent for ${validBullets.length} bullets (${projectName || 'Untitled Project'})`,
      );

      const model = new ChatOpenAI({
        modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        openAIApiKey: apiKey,
      });

      const schema = z.object({
        refinedBullets: z
          .array(z.string())
          .describe('Array of elevated project bullet points with action verbs and **bold** highlights'),
      });

      const structuredLlm = model.withStructuredOutput(schema, {
        name: 'refine_project_bullets',
        method: 'functionCalling',
      });

      const techList = technologies && technologies.length > 0 ? technologies.join(', ') : 'None specified';
      const promptText = `Project Name: ${projectName || 'Not specified'}\nTechnologies: ${techList}\n\nDraft Bullet Points:\n${validBullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}\n\nPlease elevate these project bullet points for maximum ATS and recruiter impact, highlighting key action verbs and technologies with **bold** syntax.`;

      const systemPrompt = `You are an elite ATS resume writer and software engineering hiring specialist.
Elevate the candidate's draft project bullet points into compelling, professional achievements:
1. Start each bullet point with a powerful past-tense action verb (e.g. **Spearheaded**, **Architected**, **Engineered**, **Developed**, **Designed**).
2. Seamlessly highlight primary technologies, tools, and quantifiable outcomes using **bold** markdown syntax (e.g. **Angular**, **real-time**, **PostgreSQL**).
3. Ensure high grammatical precision and conciseness. Preserve all original facts without fabricating fictional company names or unsubstantiated claims.
4. Return an array of refined bullet points in the structured output.`;

      const result = await structuredLlm.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(promptText),
      ]);

      if (!result || !Array.isArray(result.refinedBullets) || result.refinedBullets.length === 0) {
        return this.fallbackRefineBullets(validBullets, technologies);
      }

      return result.refinedBullets.map((b) => b.trim());
    } catch (error) {
      this.logger.error(
        `Project bullet refinement agent error: ${error instanceof Error ? error.message : 'Unknown error'}. Falling back to heuristic refiner.`,
      );
      return this.fallbackRefineBullets(validBullets, technologies);
    }
  }

  /**
   * Deterministic fallback to polish project bullet points when LLM is unavailable.
   */
  fallbackRefineBullets(bullets: string[], technologies?: string[]): string[] {
    const actionVerbs = ['Architected', 'Spearheaded', 'Engineered', 'Developed', 'Implemented', 'Designed'];

    return bullets.map((b, idx) => {
      let cleaned = b.replace(/\r\n/g, ' ').replace(/\s+/g, ' ').trim();
      if (!cleaned) return cleaned;

      // Check if it already starts with an action verb or bold tag
      if (!cleaned.startsWith('**')) {
        const verb = actionVerbs[idx % actionVerbs.length];
        const lowerFirst = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
        cleaned = `**${verb}** ${lowerFirst}`;
      }

      if (technologies && technologies.length > 0) {
        for (const tech of technologies) {
          if (tech && !cleaned.includes(`**${tech}**`) && cleaned.includes(tech)) {
            cleaned = cleaned.replace(new RegExp(`\\b${tech}\\b`, 'g'), `**${tech}**`);
          }
        }
      }

      if (!/[.!?]$/.test(cleaned)) {
        cleaned = `${cleaned}.`;
      }

      return cleaned;
    });
  }
}
