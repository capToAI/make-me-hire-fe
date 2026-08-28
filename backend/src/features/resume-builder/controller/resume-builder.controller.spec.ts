import { Test, TestingModule } from '@nestjs/testing';

import { ResumeBuilderController } from './resume-builder.controller';
import { ResumeBuilderService } from '../services/resume-builder.service';
import { PdfExtractorService } from '../services/pdf-extractor.service';
import { PdfGeneratorService } from '../services/pdf-generator.service';
import { ResumeExtractorAgent } from '../agent/resume-extractor.agent';
import { SectionTypeEnum } from '../models/resume-section.dto';

describe('ResumeBuilderController', () => {
  let controller: ResumeBuilderController;
  let service: ResumeBuilderService;
  let pdfGeneratorService: PdfGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumeBuilderController],
      providers: [
        ResumeBuilderService,
        PdfExtractorService,
        ResumeExtractorAgent,
        {
          provide: PdfGeneratorService,
          useValue: {
            generatePdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 mock')),
          },
        },
      ],
    }).compile();

    controller = module.get<ResumeBuilderController>(ResumeBuilderController);
    service = module.get<ResumeBuilderService>(ResumeBuilderService);
    pdfGeneratorService = module.get<PdfGeneratorService>(PdfGeneratorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call resumeBuilderService.extractResumeFromPdf', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test_resume.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1234,
      buffer: Buffer.from('test pdf content'),
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    const mockResumeState = {
      sectionOrder: ['sec-1'],
      sections: {
        'sec-1': {
          id: 'sec-1',
          type: SectionTypeEnum.BASIC,
          title: 'Personal Info',
          visible: true,
          data: {
            name: 'Jane Doe',
            jobTitle: 'Developer',
            email: 'jane@example.com',
            phone: '123-456-7890',
            location: 'New York',
          },
        },
      },
    };

    jest.spyOn(service, 'extractResumeFromPdf').mockResolvedValue(mockResumeState as any);

    const result = await controller.extractResume(mockFile);
    expect(result).toEqual(mockResumeState);
    expect(service.extractResumeFromPdf).toHaveBeenCalledWith(mockFile);
  });

  it('should call pdfGeneratorService.generatePdf and set attachment headers', async () => {
    const mockRes: any = {
      set: jest.fn(),
      end: jest.fn(),
    };

    await controller.generatePdf(
      { html: '<div>Resume</div>', format: 'letter', fileName: 'My_Resume.pdf' },
      mockRes,
    );

    expect(pdfGeneratorService.generatePdf).toHaveBeenCalledWith(
      '<div>Resume</div>',
      'letter',
    );
    expect(mockRes.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="My_Resume.pdf"',
      }),
    );
    expect(mockRes.end).toHaveBeenCalled();
  });
});

