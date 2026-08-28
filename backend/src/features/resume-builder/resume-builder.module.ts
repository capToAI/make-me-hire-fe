import { Module } from '@nestjs/common';

import { ResumeExtractorAgent } from './agent/resume-extractor.agent';
import { SummaryRefinerAgent } from './agent/summary-refiner.agent';
import { ResumeBuilderController } from './controller/resume-builder.controller';
import { PdfExtractorService } from './services/pdf-extractor.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { ResumeBuilderService } from './services/resume-builder.service';

/**
 * Feature module encapsulating resume extraction, PDF generation, and AI summary refinement.
 */
@Module({
  imports: [],
  controllers: [ResumeBuilderController],
  providers: [
    PdfExtractorService,
    PdfGeneratorService,
    ResumeBuilderService,
    ResumeExtractorAgent,
    SummaryRefinerAgent,
  ],
  exports: [PdfGeneratorService, ResumeBuilderService, SummaryRefinerAgent],
})
export class ResumeBuilderModule {}
