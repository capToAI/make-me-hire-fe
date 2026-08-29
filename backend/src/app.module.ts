import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/database/database.module';
import { UsersModule } from './features/users/users.module';
import { ResumeBuilderModule } from './features/resume-builder/resume-builder.module';
import { ResumesModule } from './features/resumes/resumes.module';

/**
 * Root application module.
 */
@Module({
  imports: [DatabaseModule, UsersModule, ResumeBuilderModule, ResumesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
