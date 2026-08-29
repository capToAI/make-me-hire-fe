import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { ResumeStateDto } from '../../resume-builder/models/resume-state.dto';

/**
 * Payload for creating a new resume associated with the authenticated user.
 * Resume Name and Position are optional and will be automatically extracted from
 * the candidate Name and Job Title within the resume data if omitted.
 */
export class CreateResumeDto {
  @ApiPropertyOptional({
    description: 'User-friendly custom name to identify the resume. Auto-derived from resume name if omitted.',
    example: 'Aswani Resume',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'The job position or role targeted by the resume. Auto-derived from resume job title if omitted.',
    example: 'Senior Software Engineer',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  position?: string;

  @ApiPropertyOptional({
    description: 'Initial resume content matching the ResumeState structure',
    type: ResumeStateDto,
  })
  @IsOptional()
  @IsObject()
  data?: ResumeStateDto | Record<string, any>;
}
