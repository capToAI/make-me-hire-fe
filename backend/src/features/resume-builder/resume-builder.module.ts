import { Module } from '@nestjs/common';

import { ResumeExtractorAgent } from './agent/resume-extractor.agent';
import { ResumeBuilderController } from './controller/resume-builder.controller';
import { PdfExtractorService } from './services/pdf-extractor.service';
import { ResumeBuilderService } from './services/resume-builder.service';

/**
 * Feature module encapsulating resume extraction and builder logic.
 */
@Module({
  imports: [],
  controllers: [ResumeBuilderController],
  providers: [PdfExtractorService, ResumeBuilderService, ResumeExtractorAgent],
  exports: [ResumeBuilderService],
})
export class ResumeBuilderModule {}
