import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepo: Partial<Record<keyof Repository<User>, jest.Mock>>;
  let mockAccountRepo: Partial<Record<keyof Repository<Account>, jest.Mock>>;

  beforeEach(async () => {
    let memoryUser: User | null = null;
    let memoryAccount: Account | null = null;

    mockUserRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }) => {
        if (where.email && memoryUser && memoryUser.email === where.email) {
          return memoryUser;
        }
        if (where.id && memoryUser && memoryUser.id === where.id) {
          return memoryUser;
        }
        return null;
      }),
      create: jest.fn().mockImplementation((dto) => ({
        id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        ...dto,
      })),
      save: jest.fn().mockImplementation(async (entity) => {
        memoryUser = { ...entity, id: entity.id || 1 };
        return memoryUser;
      }),
    };

    mockAccountRepo = {
      findOne: jest.fn().mockImplementation(async ({ where }) => {
        if (
          memoryAccount &&
          memoryAccount.provider === where.provider &&
          memoryAccount.provider_account_id === where.provider_account_id
        ) {
          return {
            ...memoryAccount,
            user: memoryUser,
          };
        }
        return null;
      }),
      create: jest.fn().mockImplementation((dto) => ({
        id: 1,
        created_at: new Date(),
        ...dto,
      })),
      save: jest.fn().mockImplementation(async (entity) => {
        memoryAccount = { ...entity, id: entity.id || 1 };
        return memoryAccount;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
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

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and sync Google user idempotently without creating duplicates', async () => {
    const googleProfile = {
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://lh3.googleusercontent.com/a/test',
      providerAccountId: 'google-sub-12345',
    };

    // First sync: creates new user
    const firstResult = await service.syncGoogleUser(googleProfile);
    expect(firstResult).toBeDefined();
    expect(firstResult.email).toBe(googleProfile.email);
    expect(firstResult.name).toBe(googleProfile.name);
    const originalId = firstResult.id;

    // Second sync with same Google account: recognizes existing user and updates details
    const secondResult = await service.syncGoogleUser({
      ...googleProfile,
      name: 'Test User Updated',
    });

    expect(secondResult.id).toBe(originalId);
    expect(secondResult.name).toBe('Test User Updated');
    expect(mockUserRepo.create).toHaveBeenCalledTimes(1); // Only created once!
  });
});
