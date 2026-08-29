import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SectionTypeEnum {
  BASIC = 'basic',
  SUMMARY = 'summary',
  SKILLS = 'skills',
  EXPERIENCE = 'experience',
  EDUCATION = 'education',
  CERTIFICATIONS = 'certifications',
  LANGUAGES = 'languages',
  CUSTOM = 'custom',
}

export class BasicDataDto {
  @ApiProperty({ description: 'Full name of candidate' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Target job title' })
  @IsString()
  jobTitle: string;

  @ApiProperty({ description: 'Contact email' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Contact phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Geographic location (City, State/Country)' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ description: 'LinkedIn profile URL' })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional({ description: 'Personal website or portfolio URL' })
  @IsOptional()
  @IsString()
  website?: string;
}

export class SummaryDataDto {
  @ApiProperty({ description: 'Professional summary paragraph' })
  @IsString()
  text: string;
}

export class SkillsDataDto {
  @ApiPropertyOptional({ description: 'Optional skill group label' })
  @IsOptional()
  @IsString()
  categoryLabel?: string;

  @ApiProperty({ description: 'Array of skill names', type: [String] })
  @IsArray()
  @IsString({ each: true })
  items: string[];
}

export class ExperienceEntryDto {
  @ApiProperty({ description: 'Unique identifier for experience entry' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Company or organization name' })
  @IsString()
  company: string;

  @ApiProperty({ description: 'Job position / title' })
  @IsString()
  role: string;

  @ApiProperty({ description: 'Start date (e.g., 2021, Jan 2021)' })
  @IsString()
  start: string;

  @ApiProperty({ description: 'End date or Present' })
  @IsString()
  end: string;

  @ApiProperty({ description: 'Whether role is currently active' })
  @IsBoolean()
  current: boolean;

  @ApiProperty({ description: 'Achievement and responsibility bullet points', type: [String] })
  @IsArray()
  @IsString({ each: true })
  bullets: string[];
}

export class ExperienceDataDto {
  @ApiProperty({ description: 'List of work experience entries', type: [ExperienceEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceEntryDto)
  entries: ExperienceEntryDto[];
}

export class EducationEntryDto {
  @ApiProperty({ description: 'Unique identifier for education entry' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Degree earned (e.g., Bachelor of Science)' })
  @IsString()
  degree: string;

  @ApiProperty({ description: 'Field of study or major' })
  @IsString()
  field: string;

  @ApiProperty({ description: 'Start year/date' })
  @IsString()
  start: string;

  @ApiProperty({ description: 'End/graduation year/date' })
  @IsString()
  end: string;
}

export class EducationDataDto {
  @ApiProperty({ description: 'List of education history entries', type: [EducationEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationEntryDto)
  entries: EducationEntryDto[];
}

export class CertificationEntryDto {
  @ApiProperty({ description: 'Unique identifier for certification entry' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Certification or credential name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Issuing organization' })
  @IsString()
  issuer: string;

  @ApiProperty({ description: 'Date of issue' })
  @IsString()
  date: string;

  @ApiPropertyOptional({ description: 'Verification URL or credential ID' })
  @IsOptional()
  @IsString()
  url: string;
}

export class CertificationsDataDto {
  @ApiProperty({ description: 'List of certifications', type: [CertificationEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationEntryDto)
  entries: CertificationEntryDto[];
}

export class LanguageEntryDto {
  @ApiProperty({ description: 'Unique identifier for language entry' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Language name' })
  @IsString()
  language: string;

  @ApiProperty({ description: 'Proficiency level (e.g., Native, Fluent, Intermediate)' })
  @IsString()
  proficiency: string;
}

export class LanguagesDataDto {
  @ApiProperty({ description: 'List of spoken languages', type: [LanguageEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageEntryDto)
  entries: LanguageEntryDto[];
}

export class CustomEntryDto {
  @ApiProperty({ description: 'Unique identifier for custom entry' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Main heading (e.g., project name, award title)' })
  @IsString()
  heading: string;

  @ApiPropertyOptional({ description: 'Subheading or role' })
  @IsOptional()
  @IsString()
  subheading?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsString()
  start?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsString()
  end?: string;

  @ApiProperty({ description: 'Detail bullet points', type: [String] })
  @IsArray()
  @IsString({ each: true })
  bullets: string[];
}

export class CustomDataDto {
  @ApiProperty({ description: 'List of custom entries', type: [CustomEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomEntryDto)
  entries: CustomEntryDto[];
}

export type SectionDataPayloadDto =
  | BasicDataDto
  | SummaryDataDto
  | SkillsDataDto
  | ExperienceDataDto
  | EducationDataDto
  | CertificationsDataDto
  | LanguagesDataDto
  | CustomDataDto;

export class SectionDto {
  @ApiProperty({ description: 'Unique identifier of the section' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ enum: SectionTypeEnum, description: 'Type of resume section' })
  @IsEnum(SectionTypeEnum)
  type: SectionTypeEnum;

  @ApiProperty({ description: 'Section display title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Whether the section is visible in preview' })
  @IsBoolean()
  visible: boolean;

  @ApiProperty({ description: 'Section specific data payload' })
  @IsNotEmpty()
  data: SectionDataPayloadDto;
}
