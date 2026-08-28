import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { ResumeExtractorAgent } from '../agent/resume-extractor.agent';
import { ResumeStateDto } from '../models/resume-state.dto';
import { PdfExtractorService } from './pdf-extractor.service';

/**
 * Main service orchestrating resume parsing and LangChain transformation.
 */
@Injectable()
export class ResumeBuilderService {
  private readonly logger = new Logger(ResumeBuilderService.name);

  constructor(
    private readonly pdfExtractorService: PdfExtractorService,
    private readonly resumeExtractorAgent: ResumeExtractorAgent,
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
}
