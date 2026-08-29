import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncGoogleUserDto } from './dto/sync-google-user.dto';
import { Account } from './entities/account.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async syncGoogleUser(dto: SyncGoogleUserDto): Promise<User> {
    const { email, name, image, providerAccountId } = dto;
    const provider = 'google';

    // 1. Check if an account already exists for this Google providerAccountId
    const existingAccount = await this.accountRepository.findOne({
      where: { provider, provider_account_id: providerAccountId },
      relations: ['user'],
    });

    if (existingAccount && existingAccount.user) {
      let user = existingAccount.user;
      let hasChanges = false;

      if (name && user.name !== name) {
        user.name = name;
        hasChanges = true;
      }
      if (image && user.image !== image) {
        user.image = image;
        hasChanges = true;
      }

      if (hasChanges) {
        user = await this.userRepository.save(user);
      }

      this.logger.log(
        `Existing Google user recognized and updated via TypeORM: ID ${user.id}, email ${email}`,
      );
      return user;
    }

    // 2. Check if a user with this email already exists (link Google account to existing user)
    let user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      let hasChanges = false;
      if (name && !user.name) {
        user.name = name;
        hasChanges = true;
      }
      if (image && !user.image) {
        user.image = image;
        hasChanges = true;
      }
      if (hasChanges) {
        user = await this.userRepository.save(user);
      }
    } else {
      // 3. Create new user entity
      user = this.userRepository.create({
        email,
        name: name ?? null,
        image: image ?? null,
      });
      user = await this.userRepository.save(user);
    }

    // 4. Create and link account record
    const account = this.accountRepository.create({
      user_id: user.id,
      provider,
      provider_account_id: providerAccountId,
    });
    await this.accountRepository.save(account);

    this.logger.log(
      `New Google user and account persisted via TypeORM: ID ${user.id}, email ${email}`,
    );
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['accounts'],
    });
  }
}
