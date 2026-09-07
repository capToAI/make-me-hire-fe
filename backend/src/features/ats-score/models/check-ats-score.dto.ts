import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

/**
 * Request payload DTO for triggering an ATS resume score check.
 */
export class CheckAtsScoreDto {
  @ApiProperty({
    description: 'Unique identifier (UUID) of the saved resume to analyze',
    example: 'd9b2d63d-a233-4f9e-9d2a-4a6c4c95f123',
  })
  @IsNotEmpty({ message: 'Resume ID is required' })
  @IsUUID('all', { message: 'Resume ID must be a valid UUID' })
  resumeId!: string;

  @ApiProperty({
    description: 'The complete job description text to compare the resume against',
    example:
      'We are seeking a Senior Full-Stack Engineer with strong TypeScript, React, and NestJS experience...',
  })
  @IsNotEmpty({ message: 'Job description cannot be empty' })
  @IsString({ message: 'Job description must be a text string' })
  @MinLength(20, {
    message: 'Job description must be at least 20 characters long for an accurate ATS evaluation',
  })
  jobDescription!: string;
}
