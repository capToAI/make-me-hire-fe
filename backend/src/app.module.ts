import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResumeBuilderModule } from './features/resume-builder/resume-builder.module';

/**
 * Root application module.
 */
@Module({
  imports: [ResumeBuilderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
