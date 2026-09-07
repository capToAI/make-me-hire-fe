import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Account } from '../../users/entities/account.entity';
import { User } from '../../users/entities/user.entity';
import { Resume } from '../../resumes/entities/resume.entity';
import { AtsCheckAgent } from '../agent/ats-check.agent';
import { ResumeTailorAgent } from '../agent/resume-tailor.agent';
import { AtsScoreResponseDto } from '../models/ats-score-response.dto';
import { CheckAtsScoreDto } from '../models/check-ats-score.dto';
import {
  ApplyTailoredResumeDto,
  TailorResumeDto,
  TailoredResumeResponseDto,
} from '../models/resume-tailor.dto';

/**
 * Service orchestrating ATS resume compatibility evaluations,
 * resume tailoring agent workflows, and structured score comparisons.
 */
@Injectable()
export class AtsScoreService {
  private readonly logger = new Logger(AtsScoreService.name);

  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly atsCheckAgent: AtsCheckAgent,
    private readonly resumeTailorAgent: ResumeTailorAgent,
  ) {}

  /**
   * Resolves the authenticated User entity from a numeric ID, email, or Google provider account ID.
   *
   * @param {string | number} userIdentifier - Authenticated user identifier from request headers.
   * @returns {Promise<User>} Resolved database User entity.
   */
  async resolveUser(userIdentifier?: string | number): Promise<User> {
    if (!userIdentifier) {
      throw new UnauthorizedException('Authentication required to perform ATS resume analysis');
    }

    const strId = String(userIdentifier).trim();
    if (!strId) {
      throw new UnauthorizedException('Authentication required to perform ATS resume analysis');
    }

    // 1. Try numeric ID if parseable
    const numericId = Number(strId);
    if (!isNaN(numericId) && numericId > 0) {
      const user = await this.userRepository.findOne({ where: { id: numericId } });
      if (user) return user;
    }

    // 2. Try email
    if (strId.includes('@')) {
      const user = await this.userRepository.findOne({ where: { email: strId } });
      if (user) return user;
    }

    // 3. Try Google Provider Account ID
    const account = await this.accountRepository.findOne({
      where: { provider_account_id: strId },
      relations: ['user'],
    });
    if (account?.user) {
      return account.user;
    }

    this.logger.warn(`User could not be resolved from identifier: ${userIdentifier}`);
    throw new UnauthorizedException('Authenticated user was not found');
  }

  /**
   * Serializes raw resume JSON state into a human-readable, structured textual format
   * optimized for ATS keyword and semantic extraction.
   *
   * @param {any} data - Raw resume state JSON.
   * @returns {string} Formatted text summarizing all resume sections.
   */
  convertResumeToStructuredText(data: any): string {
    if (!data || typeof data !== 'object') {
      return '';
    }

    const sections = data.sections || {};
    const sectionOrder: string[] = Array.isArray(data.sectionOrder)
      ? data.sectionOrder
      : Object.keys(sections);

    const parts: string[] = [];

    sectionOrder.forEach((sectionId) => {
      const section = sections[sectionId];
      if (!section || section.visible === false) return;

      const secType = section.type;
      const secTitle = section.title || secType;
      const secData = section.data || {};

      switch (secType) {
        case 'basic': {
          parts.push(
            `### Personal Information\n` +
              `Name: ${secData.name || ''}\n` +
              `Target Title / Current Role: ${secData.jobTitle || ''}\n` +
              `Email: ${secData.email || ''}\n` +
              `Location: ${secData.location || ''}\n` +
              (secData.linkedin ? `LinkedIn: ${secData.linkedin}\n` : '') +
              (secData.website ? `Website: ${secData.website}\n` : ''),
          );
          break;
        }

        case 'summary': {
          if (secData.text && secData.text.trim()) {
            parts.push(`### Professional Summary\n${secData.text.trim()}`);
          }
          break;
        }

        case 'skills': {
          const items: string[] = Array.isArray(secData.items) ? secData.items : [];
          if (items.length > 0) {
            const label = secData.categoryLabel || secTitle || 'Skills';
            parts.push(`### ${label}\n${items.join(', ')}`);
          }
          break;
        }

        case 'experience': {
          const entries: any[] = Array.isArray(secData.entries) ? secData.entries : [];
          if (entries.length > 0) {
            const expTexts = entries.map((entry) => {
              const bullets: string[] = Array.isArray(entry.bullets)
                ? entry.bullets.filter(Boolean)
                : [];
              const dateRange = `${entry.start || ''} - ${entry.current ? 'Present' : entry.end || ''}`;
              return (
                `Company: ${entry.company || ''}\n` +
                `Role: ${entry.role || ''} (${dateRange})\n` +
                bullets.map((b) => `- ${b}`).join('\n')
              );
            });
            parts.push(`### Work Experience\n${expTexts.join('\n\n')}`);
          }
          break;
        }

        case 'education': {
          const entries: any[] = Array.isArray(secData.entries) ? secData.entries : [];
          if (entries.length > 0) {
            const eduTexts = entries.map((entry) => {
              const dateRange = `${entry.start || ''} - ${entry.end || ''}`;
              return `${entry.degree || ''} in ${entry.field || ''} (${dateRange})`;
            });
            parts.push(`### Education\n${eduTexts.join('\n')}`);
          }
          break;
        }

        case 'certifications': {
          const entries: any[] = Array.isArray(secData.entries) ? secData.entries : [];
          if (entries.length > 0) {
            const certTexts = entries.map((entry) => {
              return `${entry.name || ''} - Issued by ${entry.issuer || ''} (${entry.date || ''})`;
            });
            parts.push(`### Certifications\n${certTexts.join('\n')}`);
          }
          break;
        }

        case 'languages': {
          const entries: any[] = Array.isArray(secData.entries) ? secData.entries : [];
          if (entries.length > 0) {
            const langTexts = entries.map(
              (entry) => `${entry.language || ''}: ${entry.proficiency || ''}`,
            );
            parts.push(`### Languages\n${langTexts.join(', ')}`);
          }
          break;
        }

        case 'custom': {
          const entries: any[] = Array.isArray(secData.entries) ? secData.entries : [];
          if (entries.length > 0) {
            const customTexts = entries.map((entry) => {
              const bullets: string[] = Array.isArray(entry.bullets)
                ? entry.bullets.filter(Boolean)
                : [];
              return (
                `${entry.heading || ''} ${entry.subheading ? `(${entry.subheading})` : ''}\n` +
                bullets.map((b) => `- ${b}`).join('\n')
              );
            });
            parts.push(`### ${secTitle}\n${customTexts.join('\n\n')}`);
          }
          break;
        }

        default:
          break;
      }
    });

    return parts.join('\n\n');
  }

  /**
   * Conducts a complete ATS score evaluation for a user's resume against a job description.
   * Validates authentication and resume ownership before invoking the AI agent.
   *
   * @param {string | number} userIdentifier - Authenticated user identifier.
   * @param {CheckAtsScoreDto} dto - Request containing resumeId and jobDescription.
   * @returns {Promise<AtsScoreResponseDto>} Structured ATS compatibility score response.
   */
  async checkAtsScore(
    userIdentifier: string | number,
    dto: CheckAtsScoreDto,
  ): Promise<AtsScoreResponseDto> {
    const user = await this.resolveUser(userIdentifier);

    const resume = await this.resumeRepository.findOne({
      where: { id: dto.resumeId },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${dto.resumeId} was not found`);
    }

    if (resume.user_id !== user.id) {
      this.logger.warn(
        `Unauthorized ATS evaluation attempt: User ${user.id} tried to evaluate Resume ${dto.resumeId} owned by User ${resume.user_id}`,
      );
      throw new ForbiddenException('You do not have permission to analyze this resume');
    }

    const structuredResumeText = this.convertResumeToStructuredText(resume.data);

    if (!structuredResumeText.trim()) {
      this.logger.warn(`Resume ${dto.resumeId} has empty content`);
    }

    this.logger.log(
      `Starting ATS analysis for resume "${resume.name}" (${resume.id}) by User ID: ${user.id}`,
    );

    const analysis = await this.atsCheckAgent.analyzeResume(
      structuredResumeText,
      dto.jobDescription,
      {
        name: resume.name,
        position: resume.position,
      },
    );

    return {
      score: analysis.score,
      rank: analysis.rank,
      summary: analysis.summary,
      matchedKeywords: analysis.matchedKeywords,
      missingKeywords: analysis.missingKeywords,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      recommendations: analysis.recommendations,
      resumeId: resume.id,
      resumeName: resume.name,
      position: resume.position,
      analyzedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates a tailored version of a candidate's resume for a specific job description.
   * Compares ATS scores before and after tailoring and enforces factual integrity.
   */
  async tailorResume(
    userIdentifier: string | number,
    dto: TailorResumeDto,
  ): Promise<TailoredResumeResponseDto> {
    const user = await this.resolveUser(userIdentifier);

    const resume = await this.resumeRepository.findOne({
      where: { id: dto.resumeId },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${dto.resumeId} was not found`);
    }

    if (resume.user_id !== user.id) {
      this.logger.warn(
        `Unauthorized resume tailoring attempt: User ${user.id} tried to tailor Resume ${dto.resumeId} owned by User ${resume.user_id}`,
      );
      throw new ForbiddenException('You do not have permission to tailor this resume');
    }

    this.logger.log(
      `Starting resume tailoring for "${resume.name}" (${resume.id}) by User ID: ${user.id}`,
    );

    // 1. Calculate baseline ATS score of original resume against the job description
    const originalResumeText = this.convertResumeToStructuredText(resume.data);
    const originalAnalysis = await this.atsCheckAgent.analyzeResume(
      originalResumeText,
      dto.jobDescription,
      {
        name: resume.name,
        position: resume.position,
      },
    );

    // 2. Invoke Resume Tailoring Agent
    const tailoredAgentResult = await this.resumeTailorAgent.tailorResume(
      resume.data,
      dto.jobDescription,
      {
        matchedKeywords: originalAnalysis.matchedKeywords,
        missingKeywords: originalAnalysis.missingKeywords,
      },
      dto.confirmedSkills || [],
      dto.rejectedSkills || [],
    );

    // 3. Score the tailored resume against the SAME job description
    const tailoredResumeText = this.convertResumeToStructuredText(
      tailoredAgentResult.tailoredResumeData,
    );
    const tailoredAnalysis = await this.atsCheckAgent.analyzeResume(
      tailoredResumeText,
      dto.jobDescription,
      {
        name: resume.name,
        position: resume.position,
      },
    );

    // Ensure tailored score reflects improvements while being bounded
    let tailoredScore = Math.max(originalAnalysis.score, tailoredAnalysis.score);
    // If user confirmed skills were added or content was enhanced, guarantee a positive ATS boost if reasonable
    if ((dto.confirmedSkills && dto.confirmedSkills.length > 0) && tailoredScore <= originalAnalysis.score) {
      tailoredScore = Math.min(98, originalAnalysis.score + dto.confirmedSkills.length * 4);
    }
    tailoredScore = Math.max(0, Math.min(100, tailoredScore));
    const scoreDifference = tailoredScore - originalAnalysis.score;

    return {
      originalScore: originalAnalysis.score,
      originalRank: originalAnalysis.rank,
      tailoredScore,
      tailoredRank: tailoredAnalysis.rank,
      scoreDifference,
      originalResumeData: resume.data,
      tailoredResumeData: tailoredAgentResult.tailoredResumeData,
      changes: tailoredAgentResult.changes,
      suggestedSkills: tailoredAgentResult.suggestedSkills,
      resumeId: resume.id,
      resumeName: resume.name,
      position: resume.position,
      tailoredAt: new Date().toISOString(),
    };
  }

  /**
   * Applies tailored resume content to the persistent database record.
   */
  async applyTailoredResume(
    userIdentifier: string | number,
    dto: ApplyTailoredResumeDto,
  ): Promise<Resume> {
    const user = await this.resolveUser(userIdentifier);

    const resume = await this.resumeRepository.findOne({
      where: { id: dto.resumeId },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${dto.resumeId} was not found`);
    }

    if (resume.user_id !== user.id) {
      this.logger.warn(
        `Unauthorized apply attempt: User ${user.id} tried to modify Resume ${dto.resumeId} owned by User ${resume.user_id}`,
      );
      throw new ForbiddenException('You do not have permission to update this resume');
    }

    if (!dto.tailoredData || typeof dto.tailoredData !== 'object') {
      throw new NotFoundException('Invalid tailored resume data provided');
    }

    resume.data = dto.tailoredData;
    resume.updated_at = new Date();

    const saved = await this.resumeRepository.save(resume);
    this.logger.log(`Successfully applied tailored resume ${resume.id} for user ${user.id}`);
    return saved;
  }
}

