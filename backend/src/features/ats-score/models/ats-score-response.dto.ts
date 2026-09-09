import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard match classification levels derived from ATS compatibility scores.
 */
export type AtsMatchRank =
  | 'Excellent Match'
  | 'Strong Match'
  | 'Good Match'
  | 'Moderate Match'
  | 'Low Match';

/**
 * Structured response payload containing detailed ATS resume compatibility metrics,
 * keyword gap analysis, strengths, and actionable improvement recommendations.
 */
export class AtsScoreResponseDto {
  @ApiProperty({
    description: 'Overall ATS compatibility score from 0 to 100',
    example: 82,
    minimum: 0,
    maximum: 100,
  })
  score!: number;

  @ApiProperty({
    description: 'Match classification rank based on the ATS score',
    example: 'Strong Match',
    enum: [
      'Excellent Match',
      'Strong Match',
      'Good Match',
      'Moderate Match',
      'Low Match',
    ],
  })
  rank!: AtsMatchRank;

  @ApiProperty({
    description:
      'Concise narrative summary explaining overall alignment and compatibility',
    example:
      'The resume shows high alignment with the target role, especially across backend technologies and architectural competencies.',
  })
  summary!: string;

  @ApiProperty({
    description: 'Relevant keywords found in both the resume and the job description',
    example: ['TypeScript', 'NestJS', 'PostgreSQL', 'Docker', 'REST API'],
    type: [String],
  })
  matchedKeywords!: string[];

  @ApiProperty({
    description:
      'Important keywords present in the job description but absent or weak in the resume',
    example: ['Kubernetes', 'GraphQL', 'Microservices', 'CI/CD'],
    type: [String],
  })
  missingKeywords!: string[];

  @ApiProperty({
    description:
      'Explicit technical and professional skills confirmed in the resume that match requirements',
    example: ['Node.js', 'PostgreSQL', 'System Design'],
    type: [String],
  })
  matchedSkills!: string[];

  @ApiProperty({
    description:
      'Key skills requested in the job description that could not be verified in the candidate resume',
    example: ['AWS Lambda', 'Terraform'],
    type: [String],
  })
  missingSkills!: string[];

  @ApiProperty({
    description: 'Key areas of strength identified during the ATS evaluation',
    example: [
      'Extensive backend development experience with TypeScript and NestJS.',
      'Documented hands-on relational database design and optimization.',
    ],
    type: [String],
  })
  strengths!: string[];

  @ApiProperty({
    description:
      'Specific areas where the resume could be enhanced to improve ATS parsing and relevance',
    example: [
      'Include cloud infrastructure and containerization details if applicable.',
      'Quantify project achievements with measurable business impact metrics.',
    ],
    type: [String],
  })
  improvements!: string[];

  @ApiProperty({
    description: 'Actionable steps for the candidate to tailor their resume for this role',
    example: [
      'Highlight CI/CD deployment pipelines in recent work experience bullets.',
      'Add Kubernetes or container orchestration tools to the skills section if experienced.',
    ],
    type: [String],
  })
  recommendations!: string[];

  @ApiProperty({
    description: 'UUID of the analyzed resume',
    example: 'd9b2d63d-a233-4f9e-9d2a-4a6c4c95f123',
  })
  resumeId!: string;

  @ApiProperty({
    description: 'Name of the analyzed resume',
    example: 'Aswani Resume',
  })
  resumeName!: string;

  @ApiProperty({
    description: 'Target position / job title of the analyzed resume',
    example: 'Senior Software Engineer',
  })
  position!: string;

  @ApiProperty({
    description: 'ISO timestamp when this ATS evaluation was performed',
    example: '2026-09-07T08:30:00.000Z',
  })
  analyzedAt!: string;
}
