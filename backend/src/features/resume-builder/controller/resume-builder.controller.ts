import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
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

import { ResumeStateDto } from '../models/resume-state.dto';
import { UploadResumeDto } from '../models/upload-resume.dto';
import { ResumeBuilderService } from '../services/resume-builder.service';

/**
 * Controller handling resume builder endpoints including PDF extraction.
 */
@ApiTags('Resume Builder')
@Controller('resume-builder')
export class ResumeBuilderController {
  constructor(private readonly resumeBuilderService: ResumeBuilderService) {}

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
}
