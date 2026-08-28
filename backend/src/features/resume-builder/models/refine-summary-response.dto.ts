import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object representing the result of summary refinement.
 */
export class RefineSummaryResponseDto {
  @ApiProperty({
    description: 'The original unedited summary supplied by the user',
    example:
      'Digital Marketing Executive with 2.5 years of experience in social media marketing, SEO, and Google Ads campaigns.',
  })
  oldSummary: string;

  @ApiProperty({
    description: 'The AI-refined summary polished for clarity, conciseness, and ATS impact',
    example:
      'Results-driven Digital Marketing Executive with 2.5+ years of expertise accelerating brand visibility and revenue through performance marketing, SEO strategy, and multi-channel ad campaigns.',
  })
  newSummary: string;
}
