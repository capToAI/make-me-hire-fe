import { Injectable, Logger } from '@nestjs/common';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

import {
  ATS_CHECK_SYSTEM_PROMPT,
  buildAtsCheckUserPrompt,
} from '../prompt/ats-check.prompt';
import { AtsAnalyzerTool } from './tools/ats-analyzer.tool';
import { AtsMatchRank } from '../models/ats-score-response.dto';

/**
 * Zod schema defining the expected structured response from the LLM for ATS analysis.
 */
const atsAnalysisZodSchema = z.object({
  score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('ATS compatibility score between 0 and 100'),
  rank: z
    .enum([
      'Excellent Match',
      'Strong Match',
      'Good Match',
      'Moderate Match',
      'Low Match',
    ])
    .describe('Match classification rank based on the score'),
  summary: z
    .string()
    .describe('Concise summary explaining how well the resume matches the job description'),
  matchedKeywords: z
    .array(z.string())
    .describe('Keywords found in both the resume and the job description'),
  missingKeywords: z
    .array(z.string())
    .describe('Important keywords in the job description missing or weak in the resume'),
  matchedSkills: z
    .array(z.string())
    .describe('Specific technical and professional skills matched between resume and job description'),
  missingSkills: z
    .array(z.string())
    .describe('Requested skills in the job description that are missing from the resume'),
  strengths: z
    .array(z.string())
    .describe('2 to 4 bullet points highlighting resume strengths for this job'),
  improvements: z
    .array(z.string())
    .describe('2 to 4 bullet points highlighting specific resume improvement areas'),
  recommendations: z
    .array(z.string())
    .describe('2 to 4 actionable recommendations for tailoring the resume'),
});

export type AtsAnalysisData = z.infer<typeof atsAnalysisZodSchema>;

/**
 * LangChain-powered AI Agent dedicated to conducting ATS resume evaluations.
 */
@Injectable()
export class AtsCheckAgent {
  private readonly logger = new Logger(AtsCheckAgent.name);

  constructor(private readonly analyzerTool: AtsAnalyzerTool) {}

  /**
   * Evaluates a candidate resume against a job description using LLM or deterministic fallback.
   *
   * @param {string} resumeText - Textual structured representation of the candidate resume.
   * @param {string} jobDescription - Target employer job description.
   * @param {{ name?: string; position?: string }} metadata - Resume title and position context.
   * @returns {Promise<AtsAnalysisData>} Structured ATS score and analysis metrics.
   */
  async analyzeResume(
    resumeText: string,
    jobDescription: string,
    metadata?: { name?: string; position?: string },
  ): Promise<AtsAnalysisData> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY not configured. Falling back to deterministic heuristic ATS analysis.',
      );
      return this.analyzerTool.analyzeDeterministically(
        resumeText,
        jobDescription,
        metadata,
      );
    }

    try {
      this.logger.log(
        `Invoking AI ATS Check Agent for resume "${metadata?.name || 'Resume'}" against ${jobDescription.length} char JD`,
      );

      const model = new ChatOpenAI({
        modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.1,
        openAIApiKey: apiKey,
      });

      const structuredLlm = model.withStructuredOutput(atsAnalysisZodSchema, {
        name: 'ats_resume_analysis',
        method: 'functionCalling',
      });

      const result = (await structuredLlm.invoke([
        new SystemMessage(ATS_CHECK_SYSTEM_PROMPT),
        new HumanMessage(buildAtsCheckUserPrompt(resumeText, jobDescription)),
      ])) as AtsAnalysisData;

      if (!result || typeof result.score !== 'number') {
        throw new Error('LLM returned an invalid or empty ATS score analysis.');
      }

      // Clamp score safely within 0 - 100
      const clampedScore = Math.max(0, Math.min(100, Math.round(result.score)));
      const derivedRank = this.analyzerTool.getRankFromScore(clampedScore);

      return {
        score: clampedScore,
        rank: (result.rank as AtsMatchRank) || derivedRank,
        summary: result.summary.trim(),
        matchedKeywords: Array.from(new Set(result.matchedKeywords || [])),
        missingKeywords: Array.from(new Set(result.missingKeywords || [])),
        matchedSkills: Array.from(new Set(result.matchedSkills || [])),
        missingSkills: Array.from(new Set(result.missingSkills || [])),
        strengths: result.strengths || [],
        improvements: result.improvements || [],
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      this.logger.error(
        `ATS agent LLM invocation failed: ${error instanceof Error ? error.message : 'Unknown error'}. Utilizing heuristic analyzer fallback.`,
      );
      // Seamlessly fall back to deterministic analyzer rather than breaking user experience
      return this.analyzerTool.analyzeDeterministically(
        resumeText,
        jobDescription,
        metadata,
      );
    }
  }
}
