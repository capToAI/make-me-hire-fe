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
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumeListItemDto, ResumeResponseDto } from './dto/resume-response.dto';
import { ResumesService } from './resumes.service';

/**
 * Controller providing REST APIs for user resume persistence and management.
 * All operations are strictly scoped to the authenticated user.
 */
@ApiTags('Resumes')
@Controller('api/resumes')
@ApiHeader({
  name: 'x-user-id',
  description: 'Authenticated User ID or Email',
  required: false,
})
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

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

    throw new UnauthorizedException('Authentication required. Missing x-user-id or Authorization header.');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new resume for the authenticated user',
    description:
      'Creates a new resume associated with the authenticated user with Resume Name, Position, and initial resume data.',
  })
  @ApiResponse({
    status: 201,
    description: 'Resume successfully created and persisted',
    type: ResumeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  async createResume(
    @Headers() headers: Record<string, string | undefined>,
    @Body() dto: CreateResumeDto,
  ): Promise<ResumeResponseDto> {
    const userIdentifier = this.extractUserIdentifier(headers);
    return this.resumesService.createResume(userIdentifier, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all resumes created by the authenticated user',
    description:
      'Returns a list of all resumes belonging to the currently authenticated user. Resumes of other users are excluded.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user resumes',
    type: [ResumeListItemDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  async getUserResumes(
    @Headers() headers: Record<string, string | undefined>,
  ): Promise<ResumeListItemDto[]> {
    const userIdentifier = this.extractUserIdentifier(headers);
    return this.resumesService.getUserResumes(userIdentifier);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a specific resume by ID',
    description:
      'Retrieves the full resume content and metadata. Verifies that the resume belongs to the authenticated user.',
  })
  @ApiParam({ name: 'id', description: 'Resume UUID' })
  @ApiResponse({
    status: 200,
    description: 'Resume found and returned',
    type: ResumeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own this resume' })
  @ApiResponse({ status: 404, description: 'Not Found - Resume not found' })
  async getResumeById(
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ): Promise<ResumeResponseDto> {
    const userIdentifier = this.extractUserIdentifier(headers);
    return this.resumesService.getResumeById(userIdentifier, id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update an existing resume',
    description:
      'Updates Resume Name, Position, or resume content in the database. Verifies user ownership before updating.',
  })
  @ApiParam({ name: 'id', description: 'Resume UUID' })
  @ApiResponse({
    status: 200,
    description: 'Resume successfully updated',
    type: ResumeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own this resume' })
  @ApiResponse({ status: 404, description: 'Not Found - Resume not found' })
  async updateResume(
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
    @Body() dto: UpdateResumeDto,
  ): Promise<ResumeResponseDto> {
    const userIdentifier = this.extractUserIdentifier(headers);
    return this.resumesService.updateResume(userIdentifier, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a resume',
    description:
      'Deletes a specific resume from the database. Verifies user ownership before deleting.',
  })
  @ApiParam({ name: 'id', description: 'Resume UUID' })
  @ApiResponse({
    status: 200,
    description: 'Resume successfully deleted',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - User not authenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - User does not own this resume' })
  @ApiResponse({ status: 404, description: 'Not Found - Resume not found' })
  async deleteResume(
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    const userIdentifier = this.extractUserIdentifier(headers);
    return this.resumesService.deleteResume(userIdentifier, id);
  }
}
