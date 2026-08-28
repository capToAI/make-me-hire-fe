import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Payload for requesting server-side PDF generation from rendered HTML.
 */
export class GeneratePdfDto {
  @ApiProperty({
    description: 'HTML content of the resume pages to render into vector PDF',
    example: '<div class="resume-page">...</div>',
  })
  @IsString()
  @IsNotEmpty({ message: 'HTML content must not be empty' })
  html: string;

  @ApiPropertyOptional({
    description: 'Page format: letter or a4',
    enum: ['letter', 'a4'],
    default: 'letter',
    example: 'letter',
  })
  @IsEnum(['letter', 'a4'], {
    message: 'Page format must be either "letter" or "a4"',
  })
  @IsOptional()
  format?: 'letter' | 'a4' = 'letter';

  @ApiPropertyOptional({
    description: 'Suggested file name for the downloaded PDF',
    default: 'Resume.pdf',
    example: 'John_Doe_Resume.pdf',
  })
  @IsString()
  @IsOptional()
  fileName?: string = 'Resume.pdf';
}
