import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '../../../shared/auth/auth.guard';
import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import { User } from '../../users/entities/user.entity';
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
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class AtsScoreController {
  constructor(private readonly atsScoreService: AtsScoreService) {}

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
    @CurrentUser() user: User,
    @Body() dto: CheckAtsScoreDto,
  ): Promise<AtsScoreResponseDto> {
    return this.atsScoreService.checkAtsScore(user, dto);
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
    @CurrentUser() user: User,
    @Body() dto: TailorResumeDto,
  ): Promise<TailoredResumeResponseDto> {
    return this.atsScoreService.tailorResume(user, dto);
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
    @CurrentUser() user: User,
    @Body() dto: ApplyTailoredResumeDto,
  ): Promise<{ success: boolean; message: string; resumeId: string }> {
    const updated = await this.atsScoreService.applyTailoredResume(user, dto);
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
    @CurrentUser() user: User,
    @Query('resumeId') resumeId?: string,
    @Query('limit') limit?: string,
  ): Promise<AtsEvaluation[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.atsScoreService.getEvaluationHistory(
      user,
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
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<AtsEvaluation> {
    return this.atsScoreService.getEvaluationById(user, id);
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
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.atsScoreService.deleteEvaluation(user, id);
  }
}

