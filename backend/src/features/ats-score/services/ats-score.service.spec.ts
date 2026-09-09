import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Account } from '../../users/entities/account.entity';
import { User } from '../../users/entities/user.entity';
import { Resume } from '../../resumes/entities/resume.entity';
import { AtsCheckAgent } from '../agent/ats-check.agent';
import { ResumeTailorAgent } from '../agent/resume-tailor.agent';
import { AtsAnalyzerTool } from '../agent/tools/ats-analyzer.tool';
import { ResumeTailorTool } from '../agent/tools/resume-tailor.tool';
import { AtsScoreService } from './ats-score.service';

describe('AtsScoreService', () => {
  let service: AtsScoreService;
  let mockResumeRepo: Partial<Record<keyof Repository<Resume>, jest.Mock>>;
  let mockUserRepo: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let mockAccountRepo: Partial<Record<keyof Repository<Account>, jest.Mock>>;

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
  };

  beforeEach(async () => {
    mockUserRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }: any) => {
        if (where.id === 1 || where.email === 'test@example.com') {
          return mockUser;
        }
        return null;
      }),
    };

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
    };

    mockAccountRepo = {
      findOne: jest.fn().mockResolvedValue(null),
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
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepo,
        },
      ],
    }).compile();

    service = module.get<AtsScoreService>(AtsScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('resolveUser', () => {
    it('should throw UnauthorizedException if userIdentifier is empty', async () => {
      await expect(service.resolveUser('')).rejects.toThrow(UnauthorizedException);
    });

    it('should resolve user by numeric ID', async () => {
      const user = await service.resolveUser(1);
      expect(user).toBeDefined();
      expect(user.id).toBe(1);
    });

    it('should resolve user by email', async () => {
      const user = await service.resolveUser('test@example.com');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      await expect(service.resolveUser('nonexistent@example.com')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('checkAtsScore', () => {
    it('should throw NotFoundException if resume does not exist', async () => {
      await expect(
        service.checkAtsScore(1, {
          resumeId: 'non-existent-uuid',
          jobDescription: 'Software Engineer with TypeScript and React experience.',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if resume belongs to a different user', async () => {
      await expect(
        service.checkAtsScore(1, {
          resumeId: 'resume-other-user',
          jobDescription: 'Software Engineer with TypeScript and React experience.',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should successfully evaluate ATS score for user owned resume', async () => {
      const result = await service.checkAtsScore(1, {
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
});
