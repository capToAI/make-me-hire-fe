import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { ResumeStateDto } from '../../resume-builder/models/resume-state.dto';

/**
 * Payload for updating an existing resume record.
 */
export class UpdateResumeDto {
  @ApiPropertyOptional({
    description: 'User-friendly custom name to identify the resume',
    example: 'Aswani Resume',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'The job position or role targeted by the resume',
    example: 'Senior Software Engineer',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  position?: string;

  @ApiPropertyOptional({
    description: 'Updated resume content matching the ResumeState structure',
    type: ResumeStateDto,
  })
  @IsOptional()
  @IsObject()
  data?: ResumeStateDto | Record<string, any>;
}
