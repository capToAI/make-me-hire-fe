import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AtsEvaluation } from '../entities/ats-evaluation.entity';
import { AtsScoreResponseDto } from '../models/ats-score-response.dto';
import { CheckAtsScoreDto } from '../models/check-ats-score.dto';
import {
  ApplyTailoredResumeDto,
  TailorResumeDto,
  TailoredResumeResponseDto,
} from '../models/resume-tailor.dto';
import { AtsScoreService } from '../services/ats-score.service';

/**
 * Controller handling ATS (Applicant Tracking System) resume evaluations.
 * Requires user authentication; ensures strict ownership boundaries so users can only analyze their own resumes.
 */
@ApiTags('ATS Score')
@Controller('api/ats-score')
@ApiHeader({
  name: 'x-user-id',
  description: 'Authenticated User ID or Email',
  required: false,
})
export class AtsScoreController {
  constructor(private readonly atsScoreService: AtsScoreService) {}

  /**
   * Helper to extract the authenticated user identifier from request headers.
   */
  private extractUserIdentifier(headers: Record<string, string | undefined>): string {
    const xUserId = headers['x-user-id'] || headers['X-User-Id'];
    if (xUserId && xUserId.trim()) {
      return xUserId.trim();
    }

    const xUserEmail = headers['x-user-email'] || headers['X-User-Email'];
    if (xUserEmail && xUserEmail.trim()) {
      return xUserEmail.trim();
    }

    const authHeader = headers['authorization'] || headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) return token;
    }

    throw new UnauthorizedException(
      'Authentication required. Missing x-user-id, x-user-email, or Authorization header.',
    );
  }

  @Post('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Evaluate a saved resume against a job description for ATS compatibility',
    description:
      'Compares candidate skills, experience, qualifications, and keywords from the selected resume against the provided job description using an AI agent. Returns an overall score (0-100), match rank, matched/missing keywords, and actionable recommendations.',
  })
  @ApiResponse({
    status: 200,
    description: 'ATS analysis successfully generated',
    type: AtsScoreResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation error or invalid inputs',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid authentication credentials',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not own the requested resume',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - The specified resume ID does not exist',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Failure during ATS evaluation',
  })
  async checkAtsScore(
    @Headers() headers: Record<string, string | undefined>,
    @Body() dto: CheckAtsScoreDto,
  ): Promise<AtsScoreResponseDto> {
    const userIdentifier = this.extractUserIdentifier(headers);
    return this.atsScoreService.checkAtsScore(userIdentifier, dto);
  }

  @Post('tailor')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tailor a resume specifically for a job description and compare before/after ATS scores',
    description:
      'Uses the Resume Tailoring Agent to enhance professional summary and bullet points, reorder existing skills, and identify missing job requirements. Does NOT invent experience or add unconfirmed skills. Returns side-by-side comparison data and score improvement metrics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resume successfully tailored and compared',
    type: TailoredResumeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own resume' })
  @ApiResponse({ status: 404, description: 'Not Found - Resume not found' })
  async tailorResume(
    @Headers() headers: Record<string, string | undefined>,
    @Body() dto: TailorResumeDto,
  ): Promise<TailoredResumeResponseDto> {
    const userIdentifier = this.extractUserIdentifier(headers);
    return this.atsScoreService.tailorResume(userIdentifier, dto);
  }

  @Post('apply-tailored')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Apply reviewed tailored resume data to the persistent resume record',
    description:
      'Updates the resume JSON data in the database with user-approved tailored content.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tailored resume successfully applied and persisted',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own resume' })
  @ApiResponse({ status: 404, description: 'Not Found - Resume not found' })
  async applyTailoredResume(
    @Headers() headers: Record<string, string | undefined>,
    @Body() dto: ApplyTailoredResumeDto,
  ): Promise<{ success: boolean; message: string; resumeId: string }> {
    const userIdentifier = this.extractUserIdentifier(headers);
    const updated = await this.atsScoreService.applyTailoredResume(userIdentifier, dto);
    return {
      success: true,
      message: 'Tailored resume applied successfully',
      resumeId: updated.id,
    };
  }

  @Get('history')
  @ApiOperation({
    summary: 'Retrieve historical ATS evaluations for the authenticated user',
    description:
      'Fetches past ATS evaluations, optionally filtered by resume ID, ordered by creation date descending.',
  })
  @ApiQuery({
    name: 'resumeId',
    required: false,
    description: 'Filter evaluations by specific resume UUID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of records to return (default 20, max 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of historical ATS evaluations',
    type: [AtsEvaluation],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEvaluationHistory(
    @Headers() headers: Record<string, string | undefined>,
    @Query('resumeId') resumeId?: string,
    @Query('limit') limit?: string,
  ): Promise<AtsEvaluation[]> {
    const userIdentifier = this.extractUserIdentifier(headers);
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.atsScoreService.getEvaluationHistory(
      userIdentifier,
      resumeId,
      isNaN(parsedLimit) ? 20 : parsedLimit,
    );
  }

  @Get('history/:id')
  @ApiOperation({
    summary: 'Retrieve a specific saved ATS evaluation by its UUID',
    description:
      'Returns the full saved ATS evaluation details including keywords, strengths, and recommendations.',
  })
  @ApiParam({
    name: 'id',
    description: 'Evaluation UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'ATS evaluation details',
    type: AtsEvaluation,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own this evaluation' })
  @ApiResponse({ status: 404, description: 'Not Found - Evaluation not found' })
  async getEvaluationById(
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ): Promise<AtsEvaluation> {
    const userIdentifier = this.extractUserIdentifier(headers);
    return this.atsScoreService.getEvaluationById(userIdentifier, id);
  }

  @Delete('history/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a historical ATS evaluation record',
    description: 'Removes a specific ATS evaluation from user history.',
  })
  @ApiParam({
    name: 'id',
    description: 'Evaluation UUID to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation successfully deleted',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own this evaluation' })
  @ApiResponse({ status: 404, description: 'Not Found - Evaluation not found' })
  async deleteEvaluation(
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    const userIdentifier = this.extractUserIdentifier(headers);
    return this.atsScoreService.deleteEvaluation(userIdentifier, id);
  }
}

