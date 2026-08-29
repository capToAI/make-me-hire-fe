import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../users/entities/account.entity';
import { User } from '../users/entities/user.entity';
import { Resume } from './entities/resume.entity';
import { ResumesService } from './resumes.service';

describe('ResumesService', () => {
  let service: ResumesService;
  let mockResumeRepo: Partial<Record<keyof Repository<Resume>, jest.Mock>>;
  let mockUserRepo: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let mockAccountRepo: Partial<Record<keyof Repository<Account>, jest.Mock>>;

  const mockUser1: User = {
    id: 1,
    email: 'user1@example.com',
    name: 'User One',
    image: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUser2: User = {
    id: 2,
    email: 'user2@example.com',
    name: 'User Two',
    image: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  let mockResumes: Resume[] = [];

  beforeEach(async () => {
    mockResumes = [
      {
        id: 'res-uuid-1',
        user_id: 1,
        name: 'Aswani Resume',
        position: 'Senior Software Engineer',
        data: { sectionOrder: ['sec-1'], sections: {} },
        created_at: new Date(),
        updated_at: new Date(),
        user: mockUser1,
      },
      {
        id: 'res-uuid-2',
        user_id: 2,
        name: 'Frontend Resume',
        position: 'React Developer',
        data: { sectionOrder: ['sec-1'], sections: {} },
        created_at: new Date(),
        updated_at: new Date(),
        user: mockUser2,
      },
    ];

    mockUserRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }) => {
        if (where.id === 1 || where.email === 'user1@example.com') return mockUser1;
        if (where.id === 2 || where.email === 'user2@example.com') return mockUser2;
        return null;
      }),
    };

    mockAccountRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }) => {
        if (where.provider_account_id === 'google-sub-1') {
          return { id: 1, user_id: 1, provider: 'google', provider_account_id: 'google-sub-1', user: mockUser1 };
        }
        return null;
      }),
    };

    mockResumeRepo = {
      create: jest.fn().mockImplementation((dto) => ({
        id: 'new-uuid-123',
        created_at: new Date(),
        updated_at: new Date(),
        ...dto,
      })),
      save: jest.fn().mockImplementation(async (entity) => {
        const existingIdx = mockResumes.findIndex((r) => r.id === entity.id);
        if (existingIdx >= 0) {
          mockResumes[existingIdx] = { ...mockResumes[existingIdx], ...entity, updated_at: new Date() };
          return mockResumes[existingIdx];
        }
        const created = { id: entity.id || 'new-uuid-123', created_at: new Date(), updated_at: new Date(), ...entity };
        mockResumes.push(created);
        return created;
      }),
      find: jest.fn().mockImplementation(async ({ where }) => {
        return mockResumes.filter((r) => r.user_id === where.user_id);
      }),
      findOne: jest.fn().mockImplementation(async ({ where }) => {
        return mockResumes.find((r) => r.id === where.id) || null;
      }),
      remove: jest.fn().mockImplementation(async (entity) => {
        mockResumes = mockResumes.filter((r) => r.id !== entity.id);
        return entity;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumesService,
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

    service = module.get<ResumesService>(ResumesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createResume', () => {
    it('should create a resume linked to the authenticated user', async () => {
      const result = await service.createResume(1, {
        name: 'My New Resume',
        position: 'Lead Architect',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('My New Resume');
      expect(result.position).toBe('Lead Architect');
      expect(result.userId).toBe(1);
    });

    it('should automatically extract name and position from resume data if omitted', async () => {
      const result = await service.createResume(1, {
        data: {
          sectionOrder: ['sec-basic-1'],
          sections: {
            'sec-basic-1': {
              id: 'sec-basic-1',
              type: 'basic',
              title: 'Personal Info',
              visible: true,
              data: {
                name: 'Alex Johnson',
                jobTitle: 'Cloud Architect',
              },
            },
          },
        },
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Alex Johnson Resume');
      expect(result.position).toBe('Cloud Architect');
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      await expect(
        service.createResume(999, { name: 'Fail', position: 'Dev' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getUserResumes', () => {
    it('should only return resumes belonging to the authenticated user', async () => {
      const user1Resumes = await service.getUserResumes(1);
      expect(user1Resumes).toHaveLength(1);
      expect(user1Resumes[0].name).toBe('Aswani Resume');
      expect(user1Resumes[0].userId).toBe(1);

      const user2Resumes = await service.getUserResumes(2);
      expect(user2Resumes).toHaveLength(1);
      expect(user2Resumes[0].name).toBe('Frontend Resume');
      expect(user2Resumes[0].userId).toBe(2);
    });
  });

  describe('getResumeById', () => {
    it('should return resume when owned by the user', async () => {
      const resume = await service.getResumeById(1, 'res-uuid-1');
      expect(resume).toBeDefined();
      expect(resume.id).toBe('res-uuid-1');
      expect(resume.name).toBe('Aswani Resume');
    });

    it('should throw ForbiddenException when user tries to access another users resume', async () => {
      // User 2 attempts to read User 1's resume
      await expect(service.getResumeById(2, 'res-uuid-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when resume does not exist', async () => {
      await expect(service.getResumeById(1, 'non-existent-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateResume', () => {
    it('should update resume metadata and content when owned by user', async () => {
      const updated = await service.updateResume(1, 'res-uuid-1', {
        name: 'Aswani Resume Updated',
        position: 'Principal Engineer',
      });

      expect(updated.name).toBe('Aswani Resume Updated');
      expect(updated.position).toBe('Principal Engineer');
    });

    it('should automatically sync name and position when resume data changes', async () => {
      const updated = await service.updateResume(1, 'res-uuid-1', {
        data: {
          sectionOrder: ['sec-basic-1'],
          sections: {
            'sec-basic-1': {
              id: 'sec-basic-1',
              type: 'basic',
              title: 'Personal Info',
              visible: true,
              data: {
                name: 'Samantha Ray',
                jobTitle: 'VP of Engineering',
              },
            },
          },
        },
      });

      expect(updated.name).toBe('Samantha Ray Resume');
      expect(updated.position).toBe('VP of Engineering');
    });

    it('should throw ForbiddenException when user tries to update another users resume', async () => {
      // User 1 attempts to update User 2's resume
      await expect(
        service.updateResume(1, 'res-uuid-2', { name: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteResume', () => {
    it('should delete resume when owned by user', async () => {
      const res = await service.deleteResume(1, 'res-uuid-1');
      expect(res.success).toBe(true);

      const list = await service.getUserResumes(1);
      expect(list).toHaveLength(0);
    });

    it('should throw ForbiddenException when user tries to delete another users resume', async () => {
      // User 2 attempts to delete User 1's resume
      await expect(service.deleteResume(2, 'res-uuid-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
