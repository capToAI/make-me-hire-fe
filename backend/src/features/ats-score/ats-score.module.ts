import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../../shared/auth/auth.module';
import { Resume } from '../resumes/entities/resume.entity';
import { AtsEvaluation } from './entities/ats-evaluation.entity';
import { AtsCheckAgent } from './agent/ats-check.agent';
import { ResumeTailorAgent } from './agent/resume-tailor.agent';
import { AtsAnalyzerTool } from './agent/tools/ats-analyzer.tool';
import { ResumeTailorTool } from './agent/tools/resume-tailor.tool';
import { AtsScoreController } from './controller/ats-score.controller';
import { AtsScoreService } from './services/ats-score.service';

/**
 * Module encapsulating ATS Resume Score evaluation, AI Agent orchestration,
 * resume tailoring workflows, and security-scoped resume analysis APIs.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Resume, AtsEvaluation]), AuthModule],
  controllers: [AtsScoreController],
  providers: [
    AtsAnalyzerTool,
    ResumeTailorTool,
    AtsCheckAgent,
    ResumeTailorAgent,
    AtsScoreService,
  ],
  exports: [AtsScoreService],
})
export class AtsScoreModule {}
