import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ResumeExtractorAgent } from '../agent/resume-extractor.agent';
import { SummaryRefinerAgent } from '../agent/summary-refiner.agent';
import { PdfExtractorService } from './pdf-extractor.service';
import { ResumeBuilderService } from './resume-builder.service';

describe('ResumeBuilderService', () => {
  let service: ResumeBuilderService;
  let summaryRefinerAgent: SummaryRefinerAgent;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeBuilderService,
        {
          provide: PdfExtractorService,
          useValue: {
            extractTextFromPdf: jest.fn(),
          },
        },
        {
          provide: ResumeExtractorAgent,
          useValue: {
            extractResume: jest.fn(),
          },
        },
        {
          provide: SummaryRefinerAgent,
          useValue: {
            refineSummary: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ResumeBuilderService>(ResumeBuilderService);
    summaryRefinerAgent = module.get<SummaryRefinerAgent>(SummaryRefinerAgent);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('refineSummary', () => {
    it('should throw BadRequestException if summary is empty or only whitespace', async () => {
      await expect(service.refineSummary({ summary: '' })).rejects.toThrow(BadRequestException);
      await expect(service.refineSummary({ summary: '    ' })).rejects.toThrow(BadRequestException);
    });

    it('should call summaryRefinerAgent and return oldSummary and newSummary', async () => {
      const originalText = 'Passionate developer with 3 years experience building web apps.';
      const refinedText =
        'Results-oriented Full Stack Developer with 3+ years of expertise delivering high-impact web applications.';

      jest.spyOn(summaryRefinerAgent, 'refineSummary').mockResolvedValue(refinedText);

      const response = await service.refineSummary({ summary: originalText });

      expect(summaryRefinerAgent.refineSummary).toHaveBeenCalledWith(originalText);
      expect(response).toEqual({
        oldSummary: originalText,
        newSummary: refinedText,
      });
    });
  });
});
