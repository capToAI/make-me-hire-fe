import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/database/database.module';
import { UsersModule } from './features/users/users.module';
import { ResumeBuilderModule } from './features/resume-builder/resume-builder.module';

/**
 * Root application module.
 */
@Module({
  imports: [DatabaseModule, UsersModule, ResumeBuilderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
