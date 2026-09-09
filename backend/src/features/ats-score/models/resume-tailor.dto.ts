import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { AtsMatchRank } from './ats-score-response.dto';

/**
 * Payload requesting AI tailoring of an existing resume against a job description.
 */
export class TailorResumeDto {
  @ApiProperty({
    description: 'Unique UUID of the user resume to tailor',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'resumeId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'resumeId is required' })
  resumeId!: string;

  @ApiProperty({
    description: 'Full target employer job description text',
    example:
      'We are looking for a Senior Full Stack Engineer proficient in React, TypeScript, and NestJS...',
  })
  @IsString({ message: 'jobDescription must be a string' })
  @IsNotEmpty({ message: 'jobDescription is required' })
  @MinLength(20, {
    message: 'jobDescription must contain at least 20 characters for meaningful tailoring',
  })
  jobDescription!: string;

  @ApiPropertyOptional({
    description: 'List of suggested skills explicitly confirmed by the candidate to include',
    type: [String],
    example: ['Docker', 'AWS'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  confirmedSkills?: string[];

  @ApiPropertyOptional({
    description: 'List of suggested skills explicitly rejected or skipped by the candidate',
    type: [String],
    example: ['Kubernetes'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rejectedSkills?: string[];
}

/**
 * Payload requesting application of tailored resume changes to the database record.
 */
export class ApplyTailoredResumeDto {
  @ApiProperty({
    description: 'Unique UUID of the resume to update with tailored data',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'resumeId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'resumeId is required' })
  resumeId!: string;

  @ApiProperty({
    description: 'Structured tailored resume data (ResumeState)',
  })
  @IsNotEmpty({ message: 'tailoredData is required' })
  tailoredData!: Record<string, any>;
}

export interface TailorChangeItem {
  title: string;
  description: string;
  impact: string;
}

export interface SuggestedSkillItem {
  name: string;
  reason: string;
  relevance: 'high' | 'medium' | 'low';
  status: 'pending' | 'confirmed' | 'rejected';
}

export class TailoredChangesGroupDto {
  @ApiProperty({ description: 'Summary changes made to the resume' })
  summary!: TailorChangeItem[];

  @ApiProperty({ description: 'Work experience bullet improvements and keyword alignment' })
  experience!: TailorChangeItem[];

  @ApiProperty({ description: 'Specific industry and job keywords emphasized' })
  keywords!: TailorChangeItem[];

  @ApiProperty({ description: 'Skill presentation and approved addition changes' })
  skills!: TailorChangeItem[];

  @ApiPropertyOptional({ description: 'Projects and portfolio enhancements' })
  projects?: TailorChangeItem[];
}

export class TailoredResumeResponseDto {
  @ApiProperty({ description: 'Baseline ATS score of original resume (0-100)', example: 62 })
  originalScore!: number;

  @ApiProperty({ description: 'Baseline match classification of original resume', example: 'Good Match' })
  originalRank!: AtsMatchRank;

  @ApiProperty({ description: 'Tailored ATS score (0-100)', example: 84 })
  tailoredScore!: number;

  @ApiProperty({ description: 'Tailored match classification', example: 'Strong Match' })
  tailoredRank!: AtsMatchRank;

  @ApiProperty({ description: 'Score difference (+X points)', example: 22 })
  scoreDifference!: number;

  @ApiProperty({ description: 'Original un-tailored resume data' })
  originalResumeData!: Record<string, any>;

  @ApiProperty({ description: 'Tailored resume structured data (ResumeState)' })
  tailoredResumeData!: Record<string, any>;

  @ApiProperty({ description: 'Categorized changes made during tailoring' })
  changes!: TailoredChangesGroupDto;

  @ApiProperty({ description: 'Suggested skills identified from job description requiring confirmation' })
  suggestedSkills!: SuggestedSkillItem[];

  @ApiProperty({ description: 'Target resume UUID' })
  resumeId!: string;

  @ApiProperty({ description: 'Target resume name' })
  resumeName!: string;

  @ApiProperty({ description: 'Target position title' })
  position!: string;

  @ApiProperty({ description: 'Timestamp when tailored resume was generated' })
  tailoredAt!: string;
}
