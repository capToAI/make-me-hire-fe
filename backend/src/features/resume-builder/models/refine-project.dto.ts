import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

/**
 * Data transfer object for refining project bullet points with AI.
 */
export class RefineProjectBulletsDto {
  @ApiPropertyOptional({
    description: 'Project name or title providing contextual domain knowledge to AI',
    example: 'South Stream - Asset Trace',
  })
  @IsOptional()
  @IsString()
  projectName?: string;

  @ApiPropertyOptional({
    description: 'Array of technologies utilized in the project',
    type: [String],
    example: ['Angular', 'Leaflet', 'TypeScript'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiProperty({
    description: 'Current draft bullet points describing project features or achievements',
    type: [String],
    example: ['Built tracking platform for gas network with real-time map'],
  })
  @IsArray()
  @IsString({ each: true })
  bullets: string[];
}

/**
 * Data transfer object representing the response from project bullet refinement.
 */
export class RefineProjectBulletsResponseDto {
  @ApiProperty({
    description: 'The original unedited bullet points supplied by the user',
    type: [String],
  })
  originalBullets: string[];

  @ApiProperty({
    description: 'The AI-refined bullet points elevated with action verbs, metrics, and bold highlights',
    type: [String],
    example: [
      '**Spearheaded** the development of a real-time asset tracking platform across gas distribution networks, integrating interactive map visualization.',
    ],
  })
  refinedBullets: string[];
}
