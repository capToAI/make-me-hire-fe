import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AtsScoreResponseDto } from '../models/ats-score-response.dto';
import { CheckAtsScoreDto } from '../models/check-ats-score.dto';
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
}
