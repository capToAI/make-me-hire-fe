import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { GeneratePdfDto } from '../models/generate-pdf.dto';
import { ResumeStateDto } from '../models/resume-state.dto';
import { UploadResumeDto } from '../models/upload-resume.dto';
import { PdfGeneratorService } from '../services/pdf-generator.service';
import { ResumeBuilderService } from '../services/resume-builder.service';

/**
 * Controller handling resume builder endpoints including PDF extraction and generation.
 */
@ApiTags('Resume Builder')
@Controller('resume-builder')
export class ResumeBuilderController {
  constructor(
    private readonly resumeBuilderService: ResumeBuilderService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}


  /**
   * Uploads and parses a PDF resume into the standardized ResumeState JSON structure.
   *
   * @param {Express.Multer.File} file - Uploaded resume PDF.
   * @returns {Promise<ResumeStateDto>} Parsed ResumeState data.
   */
  @Post('extract')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  @ApiOperation({
    summary: 'Extract structured resume from uploaded PDF',
    description:
      'Uploads a resume PDF, extracts the text content, and passes it to an AI Agent to convert into standardized ResumeState JSON for the resume preview.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Resume PDF upload payload',
    type: UploadResumeDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully parsed and structured resume data',
    type: ResumeStateDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Missing or invalid PDF file',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - LLM or parsing error',
  })
  async extractResume(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResumeStateDto> {
    return this.resumeBuilderService.extractResumeFromPdf(file);
  }

  /**
   * Generates a text-selectable, ATS-friendly vector PDF from rendered resume HTML.
   *
   * @param {GeneratePdfDto} dto - Contains HTML string, format, and filename.
   * @param {Response} res - Express HTTP response object.
   */
  @Post('generate-pdf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate text-selectable vector PDF from resume HTML',
    description:
      'Renders the provided resume HTML into a high-fidelity, ATS-compliant vector PDF using headless Chromium.',
  })
  @ApiBody({
    description: 'Resume HTML and page layout parameters',
    type: GeneratePdfDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Vector PDF binary stream',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Missing or invalid HTML content',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Chromium rendering failed',
  })
  async generatePdf(
    @Body() dto: GeneratePdfDto,
    @Res() res: Response,
  ): Promise<void> {
    const pdfBuffer = await this.pdfGeneratorService.generatePdf(
      dto.html,
      dto.format ?? 'letter',
    );

    const safeFileName = dto.fileName
      ? dto.fileName.endsWith('.pdf')
        ? dto.fileName
        : `${dto.fileName}.pdf`
      : 'Resume.pdf';

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(safeFileName)}"`,
      'Content-Length': pdfBuffer.length.toString(),
    });

    res.end(pdfBuffer);
  }
}

