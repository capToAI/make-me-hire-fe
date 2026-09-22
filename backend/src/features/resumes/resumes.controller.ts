import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../shared/auth/auth.guard';
import { CurrentUser } from '../../shared/auth/current-user.decorator';
import { User } from '../users/entities/user.entity';
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
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

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
    @CurrentUser() user: User,
    @Body() dto: CreateResumeDto,
  ): Promise<ResumeResponseDto> {
    return this.resumesService.createResume(user, dto);
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
    @CurrentUser() user: User,
    @Query('type') type?: 'base' | 'tailored',
  ): Promise<ResumeListItemDto[]> {
    return this.resumesService.getUserResumes(user, type);
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
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<ResumeResponseDto> {
    return this.resumesService.getResumeById(user, id);
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
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateResumeDto,
  ): Promise<ResumeResponseDto> {
    return this.resumesService.updateResume(user, id, dto);
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
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.resumesService.deleteResume(user, id);
  }
}
