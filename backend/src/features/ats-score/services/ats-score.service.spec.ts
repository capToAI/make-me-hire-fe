import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Resume } from '../../resumes/entities/resume.entity';
import { AtsEvaluation } from '../entities/ats-evaluation.entity';
import { AtsCheckAgent } from '../agent/ats-check.agent';
import { ResumeTailorAgent } from '../agent/resume-tailor.agent';
import { AtsAnalyzerTool } from '../agent/tools/ats-analyzer.tool';
import { ResumeTailorTool } from '../agent/tools/resume-tailor.tool';
import { AtsScoreService } from './ats-score.service';

describe('AtsScoreService', () => {
  let service: AtsScoreService;
  let analyzerTool: AtsAnalyzerTool;
  let mockResumeRepo: Partial<Record<keyof Repository<Resume>, jest.Mock>>;
  let mockAtsEvaluationRepo: Partial<Record<keyof Repository<AtsEvaluation>, jest.Mock>>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    created_at: new Date(),
    updated_at: new Date(),
    resumes: [],
    accounts: [],
  };

  const mockResume: Resume = {
    id: 'resume-uuid-1',
    user_id: 1,
    name: 'Aswani Resume',
    position: 'Senior Software Engineer',
    data: {
      sectionOrder: ['sec-basic-1', 'sec-skills-1'],
      sections: {
        'sec-basic-1': {
          id: 'sec-basic-1',
          type: 'basic',
          title: 'Personal Info',
          visible: true,
          data: {
            name: 'Aswani Kumar',
            jobTitle: 'Senior Software Engineer',
            email: 'aswani@example.com',
          },
        },
        'sec-skills-1': {
          id: 'sec-skills-1',
          type: 'skills',
          title: 'Skills',
          visible: true,
          data: {
            items: ['TypeScript', 'NestJS', 'React', 'PostgreSQL'],
          },
        },
      },
    },
    created_at: new Date(),
    updated_at: new Date(),
    user: mockUser,
    resume_type: 'base',
    parent_resume_id: null,
    ats_evaluation_id: null,
  };

  beforeEach(async () => {
    mockResumeRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }: any) => {
        if (where.id === 'resume-uuid-1') {
          return { ...mockResume };
        }
        if (where.id === 'resume-other-user') {
          return { ...mockResume, id: 'resume-other-user', user_id: 99 };
        }
        return null;
      }),
      create: jest.fn().mockImplementation((dto) => ({ id: 'tailored-resume-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(async (entity) => ({
        updated_at: new Date(),
        ...entity,
      })),
    };

    mockAtsEvaluationRepo = {
      create: jest.fn().mockImplementation((dto) => ({ id: 'eval-uuid-1', ...dto })),
      save: jest.fn().mockImplementation(async (entity) => ({ id: 'eval-uuid-1', ...entity })),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtsScoreService,
        AtsCheckAgent,
        AtsAnalyzerTool,
        ResumeTailorAgent,
        ResumeTailorTool,
        {
          provide: getRepositoryToken(Resume),
          useValue: mockResumeRepo,
        },
        {
          provide: getRepositoryToken(AtsEvaluation),
          useValue: mockAtsEvaluationRepo,
        },
      ],
    }).compile();

    service = module.get<AtsScoreService>(AtsScoreService);
    analyzerTool = module.get<AtsAnalyzerTool>(AtsAnalyzerTool);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkAtsScore', () => {
    it('should throw NotFoundException if resume does not exist', async () => {
      await expect(
        service.checkAtsScore(mockUser, {
          resumeId: 'non-existent-uuid',
          jobDescription: 'Software Engineer with TypeScript and React experience.',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if resume belongs to a different user', async () => {
      await expect(
        service.checkAtsScore(mockUser, {
          resumeId: 'resume-other-user',
          jobDescription: 'Software Engineer with TypeScript and React experience.',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should successfully evaluate ATS score for user owned resume', async () => {
      const result = await service.checkAtsScore(mockUser, {
        resumeId: 'resume-uuid-1',
        jobDescription: 'We are looking for a Senior Software Engineer with TypeScript, NestJS, and AWS experience.',
      });

      expect(result).toBeDefined();
      expect(result.resumeId).toBe('resume-uuid-1');
      expect(result.resumeName).toBe('Aswani Resume');
      expect(result.position).toBe('Senior Software Engineer');
      expect(result.score).toBeGreaterThan(0);
      expect(result.rank).toBeDefined();
      expect(result.matchedSkills).toContain('TypeScript');
      expect(result.matchedSkills).toContain('NestJS');
      expect(result.analyzedAt).toBeTruthy();
    });
  });

  describe('tailorResume', () => {
    it('should throw NotFoundException if resume does not exist', async () => {
      await expect(
        service.tailorResume(mockUser, {
          resumeId: 'non-existent-uuid',
          jobDescription: 'Software Engineer with TypeScript and React experience.',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if resume belongs to a different user', async () => {
      await expect(
        service.tailorResume(mockUser, {
          resumeId: 'resume-other-user',
          jobDescription: 'Software Engineer with TypeScript and React experience.',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return a tailoredScore whose rank is derived from that same score, not from a separate heuristic blend', async () => {
      const result = await service.tailorResume(mockUser, {
        resumeId: 'resume-uuid-1',
        jobDescription:
          'We are looking for a Senior Software Engineer with TypeScript, NestJS, React, and AWS experience. AWS is required.',
        confirmedSkills: ['AWS'],
      });

      expect(result).toBeDefined();
      expect(result.tailoredScore).toBeGreaterThanOrEqual(result.originalScore);
      expect(result.tailoredScore).toBeLessThanOrEqual(100);
      // The rank must always be exactly what getRankFromScore derives from the
      // reported score — no independently-computed score/rank pair.
      expect(result.tailoredRank).toBe(analyzerTool.getRankFromScore(result.tailoredScore));
      expect(result.scoreDifference).toBe(result.tailoredScore - result.originalScore);
    });
  });

  describe('applyTailoredResume', () => {
    it('should throw BadRequestException (not NotFoundException) for invalid tailored resume data', async () => {
      await expect(
        service.applyTailoredResume(mockUser, {
          resumeId: 'resume-uuid-1',
          tailoredData: null as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if resume does not exist', async () => {
      await expect(
        service.applyTailoredResume(mockUser, {
          resumeId: 'non-existent-uuid',
          tailoredData: { sections: {} },
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
