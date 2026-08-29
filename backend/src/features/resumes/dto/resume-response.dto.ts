import { ApiProperty } from '@nestjs/swagger';
import { ResumeStateDto } from '../../resume-builder/models/resume-state.dto';

/**
 * DTO for full resume response including metadata and content.
 */
export class ResumeResponseDto {
  @ApiProperty({ example: 'b62283ea-e659-4bf9-866d-8636b04f7623' })
  id!: string;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 'Aswani Resume' })
  name!: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  position!: string;

  @ApiProperty({ type: ResumeStateDto })
  data!: Record<string, any>;

  @ApiProperty({ example: '2026-08-29T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-29T10:00:00.000Z' })
  updatedAt!: Date;
}

/**
 * Lightweight DTO for listing resumes on user dashboard.
 */
export class ResumeListItemDto {
  @ApiProperty({ example: 'b62283ea-e659-4bf9-866d-8636b04f7623' })
  id!: string;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 'Aswani Resume' })
  name!: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  position!: string;

  @ApiProperty({ example: '2026-08-29T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-29T10:00:00.000Z' })
  updatedAt!: Date;
}
