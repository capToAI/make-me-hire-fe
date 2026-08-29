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
}
