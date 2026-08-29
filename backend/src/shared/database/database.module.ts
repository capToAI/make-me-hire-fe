import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../features/users/entities/user.entity';
import { Account } from '../../features/users/entities/account.entity';
import { Resume } from '../../features/resumes/entities/resume.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;

        const synchronize =
          process.env.DATABASE_SYNCHRONIZE !== undefined
            ? process.env.DATABASE_SYNCHRONIZE === 'true'
            : process.env.NODE_ENV !== 'production';

        const isLocalOrDocker =
          !url ||
          url.includes('localhost') ||
          url.includes('127.0.0.1') ||
          url.includes('@postgres:') ||
          url.includes('@db:');

        const ssl =
          process.env.DATABASE_SSL !== undefined
            ? process.env.DATABASE_SSL === 'true'
              ? { rejectUnauthorized: false }
              : false
            : process.env.NODE_ENV === 'production' && !isLocalOrDocker
              ? { rejectUnauthorized: false }
              : false;

        return {
          type: 'postgres',
          url,
          entities: [User, Account, Resume],
          synchronize,
          autoLoadEntities: true,
          ssl,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
