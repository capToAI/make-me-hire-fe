import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AtsScoreResponseDto } from '../models/ats-score-response.dto';
import { CheckAtsScoreDto } from '../models/check-ats-score.dto';
import { AtsScoreService } from '../services/ats-score.service';
import { AtsScoreController } from './ats-score.controller';

describe('AtsScoreController', () => {
  let controller: AtsScoreController;
  let service: AtsScoreService;

  const mockResponse: AtsScoreResponseDto = {
    score: 85,
    rank: 'Excellent Match',
    summary: 'Strong alignment with target role.',
    matchedKeywords: ['TypeScript', 'React'],
    missingKeywords: ['Docker'],
    matchedSkills: ['TypeScript', 'React'],
    missingSkills: ['Docker'],
    strengths: ['Great technical background'],
    improvements: ['Include container tools'],
    recommendations: ['Highlight projects'],
    resumeId: 'resume-uuid-1',
    resumeName: 'Aswani Resume',
    position: 'Senior Software Engineer',
    analyzedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtsScoreController],
      providers: [
        {
          provide: AtsScoreService,
          useValue: {
            checkAtsScore: jest.fn().mockResolvedValue(mockResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<AtsScoreController>(AtsScoreController);
    service = module.get<AtsScoreService>(AtsScoreService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw UnauthorizedException when no auth headers are provided', async () => {
    const dto: CheckAtsScoreDto = {
      resumeId: 'resume-uuid-1',
      jobDescription: 'Software Engineer requirements and qualifications description.',
    };

    await expect(controller.checkAtsScore({}, dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should accept x-user-id header and delegate to atsScoreService', async () => {
    const dto: CheckAtsScoreDto = {
      resumeId: 'resume-uuid-1',
      jobDescription: 'Software Engineer requirements and qualifications description.',
    };

    const headers = { 'x-user-id': '1' };
    const result = await controller.checkAtsScore(headers, dto);

    expect(result).toEqual(mockResponse);
    expect(service.checkAtsScore).toHaveBeenCalledWith('1', dto);
  });

  it('should accept Bearer token authorization header', async () => {
    const dto: CheckAtsScoreDto = {
      resumeId: 'resume-uuid-1',
      jobDescription: 'Software Engineer requirements and qualifications description.',
    };

    const headers = { authorization: 'Bearer user-token-123' };
    const result = await controller.checkAtsScore(headers, dto);

    expect(result).toEqual(mockResponse);
    expect(service.checkAtsScore).toHaveBeenCalledWith('user-token-123', dto);
  });
});
