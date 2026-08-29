import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PdfExtractorService } from './pdf-extractor.service';

describe('PdfExtractorService', () => {
  let service: PdfExtractorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfExtractorService],
    }).compile();

    service = module.get<PdfExtractorService>(PdfExtractorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException when buffer is empty', async () => {
    await expect(service.extractTextFromPdf(Buffer.from([]))).rejects.toThrow(
      BadRequestException,
    );
  });
});
