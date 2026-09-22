import { Test, TestingModule } from '@nestjs/testing';

import { AuthGuard } from '../../../shared/auth/auth.guard';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { AtsScoreResponseDto } from '../models/ats-score-response.dto';
import { CheckAtsScoreDto } from '../models/check-ats-score.dto';
import { AtsScoreService } from '../services/ats-score.service';
import { AtsScoreController } from './ats-score.controller';

describe('AtsScoreController', () => {
  let controller: AtsScoreController;
  let service: AtsScoreService;

  const mockUser: User = { id: 1, email: 'test@example.com' } as User;

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
        AuthGuard,
        {
          provide: UsersService,
          useValue: { getUserById: jest.fn().mockResolvedValue(mockUser) },
        },
      ],
    }).compile();

    controller = module.get<AtsScoreController>(AtsScoreController);
    service = module.get<AtsScoreService>(AtsScoreService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates to atsScoreService with the authenticated user resolved by AuthGuard', async () => {
    const dto: CheckAtsScoreDto = {
      resumeId: 'resume-uuid-1',
      jobDescription: 'Software Engineer requirements and qualifications description.',
    };

    const result = await controller.checkAtsScore(mockUser, dto);

    expect(result).toEqual(mockResponse);
    expect(service.checkAtsScore).toHaveBeenCalledWith(mockUser, dto);
  });
});
