import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import 'multer';

import { ResumeExtractorAgent } from '../agent/resume-extractor.agent';
import { SummaryRefinerAgent } from '../agent/summary-refiner.agent';
import { RefineSummaryDto } from '../models/refine-summary.dto';
import { RefineSummaryResponseDto } from '../models/refine-summary-response.dto';
import { ResumeStateDto } from '../models/resume-state.dto';
import { PdfExtractorService } from './pdf-extractor.service';

/**
 * Main service orchestrating resume parsing, PDF conversion, and AI summary refinement.
 */
@Injectable()
export class ResumeBuilderService {
  private readonly logger = new Logger(ResumeBuilderService.name);

  constructor(
    private readonly pdfExtractorService: PdfExtractorService,
    private readonly resumeExtractorAgent: ResumeExtractorAgent,
    private readonly summaryRefinerAgent: SummaryRefinerAgent,
  ) {}

  /**
   * Extracts content from an uploaded PDF resume and converts it to ResumeStateDto.
   *
   * @param {Express.Multer.File} file - Uploaded PDF file object.
   * @returns {Promise<ResumeStateDto>} Parsed and normalized resume data.
   */
  async extractResumeFromPdf(file: Express.Multer.File): Promise<ResumeStateDto> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No PDF file provided for upload.');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        `Invalid file format: ${file.mimetype}. Only application/pdf files are supported.`,
      );
    }

    this.logger.log(`Extracting text from PDF: ${file.originalname} (${file.size} bytes)`);
    const rawText = await this.pdfExtractorService.extractTextFromPdf(file.buffer);

    this.logger.log(`Transforming ${rawText.length} characters of resume text with LLM Agent`);
    const resumeState = await this.resumeExtractorAgent.extractResume(rawText);

    return resumeState;
  }

  /**
   * Refines a candidate's existing resume summary using the Summary Refiner Agent.
   *
   * @param {RefineSummaryDto} dto - Contains the original resume summary.
   * @returns {Promise<RefineSummaryResponseDto>} Object with oldSummary and newSummary.
   */
  async refineSummary(dto: RefineSummaryDto): Promise<RefineSummaryResponseDto> {
    const rawSummary = dto?.summary;

    if (!rawSummary || !rawSummary.trim()) {
      throw new BadRequestException('Summary text cannot be empty or contain only whitespace.');
    }

    this.logger.log(`Refining resume summary (${rawSummary.length} chars)`);
    const newSummary = await this.summaryRefinerAgent.refineSummary(rawSummary);

    return {
      oldSummary: rawSummary,
      newSummary,
    };
  }
}
