import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';

import { SectionDto } from './resume-section.dto';

/**
 * Root DTO matching the frontend ResumeState schema.
 */
export class ResumeStateDto {
  @ApiProperty({
    description: 'Ordered list of section IDs specifying vertical display sequence',
    type: [String],
    example: ['sec-basic-1', 'sec-summary-1', 'sec-skills-1', 'sec-exp-1'],
  })
  @IsArray()
  @IsString({ each: true })
  sectionOrder: string[];

  @ApiProperty({
    description: 'Dictionary map of section ID to section configuration and data',
    type: 'object',
    additionalProperties: {
      type: 'object',
    },
  })
  @IsNotEmpty()
  @IsObject()
  sections: Record<string, SectionDto>;
}
