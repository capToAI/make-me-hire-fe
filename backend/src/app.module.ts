import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/database/database.module';
import { AtsScoreModule } from './features/ats-score/ats-score.module';
import { ResumeBuilderModule } from './features/resume-builder/resume-builder.module';
import { ResumesModule } from './features/resumes/resumes.module';
import { UsersModule } from './features/users/users.module';

/**
 * Root application module.
 */
@Module({
  imports: [
    AtsScoreModule,
    DatabaseModule,
    ResumeBuilderModule,
    ResumesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
