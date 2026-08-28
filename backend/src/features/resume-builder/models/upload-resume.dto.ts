import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for Swagger multipart form-data PDF resume upload.
 */
export class UploadResumeDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Resume PDF file (maximum 10MB)',
  })
  file: Express.Multer.File;
}
