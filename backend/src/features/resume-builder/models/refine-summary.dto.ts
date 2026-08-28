import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Data transfer object for resume summary refinement request.
 */
export class RefineSummaryDto {
  @ApiProperty({
    description: 'Current resume summary content to be refined by the AI agent',
    example:
      'Digital Marketing Executive with 2.5 years of experience in social media marketing, SEO, and Google Ads campaigns.',
  })
  @IsNotEmpty({ message: 'Summary text cannot be empty.' })
  @IsString({ message: 'Summary must be a string.' })
  @MaxLength(5000, { message: 'Summary text cannot exceed 5000 characters.' })
  summary: string;
}
