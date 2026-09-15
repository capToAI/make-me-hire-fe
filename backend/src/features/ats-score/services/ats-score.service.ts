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
import { AtsEvaluation } from '../entities/ats-evaluation.entity';
import { AtsAnalyzerTool } from '../agent/tools/ats-analyzer.tool';
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
    @InjectRepository(AtsEvaluation)
    private readonly atsEvaluationRepository: Repository<AtsEvaluation>,
    private readonly atsCheckAgent: AtsCheckAgent,
    private readonly resumeTailorAgent: ResumeTailorAgent,
    private readonly analyzerTool: AtsAnalyzerTool,
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

        case 'projects': {
          const entries: any[] = Array.isArray(secData.entries) ? secData.entries : [];
          if (entries.length > 0) {
            const projectTexts = entries.map((entry) => {
              const bullets: string[] = Array.isArray(entry.bullets)
                ? entry.bullets.filter(Boolean)
                : [];
              const tech =
                Array.isArray(entry.technologies) && entry.technologies.length > 0
                  ? `Technologies: ${entry.technologies.join(', ')}`
                  : '';
              const link = entry.link ? `Link: ${entry.link}` : '';
              const header = [entry.name, tech, link].filter(Boolean).join(' | ');
              return `${header}\n` + bullets.map((b) => `- ${b}`).join('\n');
            });
            parts.push(`### Projects\n${projectTexts.join('\n\n')}`);
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
   * Extracts all explicit candidate skills, technologies, and certifications directly
   * from the resume JSON state across any profession (tech, healthcare, accounting, etc.).
   */
  extractExplicitCandidateSkills(data: any): string[] {
    if (!data || typeof data !== 'object') return [];

    const skills = new Set<string>();
    const sections = data.sections || {};

    Object.values(sections).forEach((section: any) => {
      if (!section) return;

      // 1. Skills section items
      if (section.type === 'skills' && Array.isArray(section.data?.items)) {
        section.data.items.forEach((item: any) => {
          if (typeof item === 'string' && item.trim()) {
            skills.add(item.trim());
          }
        });
      }

      // 2. Projects technology tags
      if (section.type === 'projects' && Array.isArray(section.data?.entries)) {
        section.data.entries.forEach((entry: any) => {
          if (Array.isArray(entry.technologies)) {
            entry.technologies.forEach((tech: any) => {
              if (typeof tech === 'string' && tech.trim()) {
                skills.add(tech.trim());
              }
            });
          }
        });
      }

      // 3. Certifications titles/names
      if (section.type === 'certifications' && Array.isArray(section.data?.entries)) {
        section.data.entries.forEach((entry: any) => {
          if (typeof entry.name === 'string' && entry.name.trim()) {
            skills.add(entry.name.trim());
          }
        });
      }

      // 4. Custom section headings or items if designated as skills/tools
      if (section.type === 'custom' && Array.isArray(section.data?.entries)) {
        section.data.entries.forEach((entry: any) => {
          if (typeof entry.heading === 'string' && entry.heading.trim().length <= 40) {
            skills.add(entry.heading.trim());
          }
        });
      }
    });

    return Array.from(skills);
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
    const explicitSkills = this.extractExplicitCandidateSkills(resume.data);

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
      explicitSkills,
    );

    // Persist ATS evaluation to history
    const evaluation = this.atsEvaluationRepository.create({
      userId: user.id,
      resumeId: resume.id,
      jobTitle: resume.position || 'Target Role',
      jobDescription: dto.jobDescription,
      score: analysis.score,
      rank: analysis.rank,
      summary: analysis.summary,
      matchedKeywords: analysis.matchedKeywords || [],
      missingKeywords: analysis.missingKeywords || [],
      matchedSkills: analysis.matchedSkills || [],
      missingSkills: analysis.missingSkills || [],
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      recommendations: analysis.recommendations || [],
    });

    const savedEvaluation = await this.atsEvaluationRepository.save(evaluation);
    this.logger.log(`Persisted ATS evaluation ${savedEvaluation.id} for Resume ${resume.id}`);

    return {
      id: savedEvaluation.id,
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
      analyzedAt: savedEvaluation.createdAt
        ? savedEvaluation.createdAt.toISOString()
        : new Date().toISOString(),
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
    const originalExplicitSkills = this.extractExplicitCandidateSkills(resume.data);
    const originalAnalysis = await this.atsCheckAgent.analyzeResume(
      originalResumeText,
      dto.jobDescription,
      {
        name: resume.name,
        position: resume.position,
      },
      originalExplicitSkills,
    );

    // 2. Invoke Resume Tailoring Agent with full matched and missing context
    const allMatchedForTailoring = Array.from(
      new Set([
        ...(originalAnalysis.matchedSkills || []),
        ...(originalAnalysis.matchedKeywords || []),
      ]),
    );
    const allMissingForTailoring = Array.from(
      new Set([
        ...(originalAnalysis.missingSkills || []),
        ...(originalAnalysis.missingKeywords || []),
      ]),
    );

    const tailoredAgentResult = await this.resumeTailorAgent.tailorResume(
      resume.data,
      dto.jobDescription,
      {
        matchedKeywords: allMatchedForTailoring,
        missingKeywords: allMissingForTailoring,
        matchedSkills: originalAnalysis.matchedSkills,
        missingSkills: originalAnalysis.missingSkills,
      },
      dto.confirmedSkills || [],
      dto.rejectedSkills || [],
    );

    // 3. Score the tailored resume against the SAME job description
    const tailoredResumeText = this.convertResumeToStructuredText(
      tailoredAgentResult.tailoredResumeData,
    );
    const tailoredExplicitSkills = this.extractExplicitCandidateSkills(
      tailoredAgentResult.tailoredResumeData,
    );

    // Extract tailored position from basic section if updated to secure title bonus
    let tailoredPosition = resume.position;
    const basicSection = Object.values(
      tailoredAgentResult.tailoredResumeData?.sections || {},
    ).find((sec: any) => sec?.type === 'basic');
    if ((basicSection as any)?.data?.jobTitle) {
      tailoredPosition = (basicSection as any).data.jobTitle;
    }

    const tailoredAnalysis = await this.atsCheckAgent.analyzeResume(
      tailoredResumeText,
      dto.jobDescription,
      {
        name: resume.name,
        position: tailoredPosition,
      },
      tailoredExplicitSkills,
    );

    // Calculate authentic confirmed skill score impact from the ATS analyzer
    let confirmedSkillsImpact = 0;
    if (Array.isArray(dto.confirmedSkills) && dto.confirmedSkills.length > 0) {
      const totalEstimatedSkills = Math.max(
        10,
        (originalAnalysis.matchedSkills?.length || 0) + (originalAnalysis.missingSkills?.length || 0),
      );
      dto.confirmedSkills.forEach((skill) => {
        confirmedSkillsImpact += this.analyzerTool.calculateSkillMarginalImpact(
          skill,
          totalEstimatedSkills,
          dto.jobDescription,
        );
      });
    }

    // Determine final tailored score:
    // Tailored score reflects authentic baseline score plus exact marginal point impact of confirmed skills
    const baseProgressScore = Math.max(originalAnalysis.score, tailoredAnalysis.score);
    let tailoredScore = baseProgressScore;
    if (confirmedSkillsImpact > 0) {
      tailoredScore = Math.min(98, originalAnalysis.score + confirmedSkillsImpact);
    }
    tailoredScore = Math.max(0, Math.min(100, tailoredScore));
    const scoreDifference = tailoredScore - originalAnalysis.score;

    // Persist or update the tailored resume in the resumes table
    let savedTailoredResume: Resume;

    if (dto.tailoredResumeId) {
      // Update existing tailored resume
      const existing = await this.resumeRepository.findOne({
        where: { id: dto.tailoredResumeId, user_id: user.id },
      });
      if (existing) {
        existing.data = tailoredAgentResult.tailoredResumeData;
        existing.position = tailoredPosition;
        existing.updated_at = new Date();
        savedTailoredResume = await this.resumeRepository.save(existing);
        this.logger.log(
          `Updated tailored resume ${savedTailoredResume.id} for user ${user.id}`,
        );
      } else {
        // Fallback: create if specified ID not found
        const newRecord = this.resumeRepository.create({
          user_id: user.id,
          name: `${resume.name} (Tailored)`,
          position: tailoredPosition,
          data: tailoredAgentResult.tailoredResumeData,
          resume_type: 'tailored',
          parent_resume_id: resume.id,
        });
        savedTailoredResume = await this.resumeRepository.save(newRecord);
        this.logger.log(
          `Created new tailored resume ${savedTailoredResume.id} for user ${user.id}`,
        );
      }
    } else {
      // First-time tailoring: create brand-new tailored resume entry
      const newRecord = this.resumeRepository.create({
        user_id: user.id,
        name: `${resume.name} (Tailored)`,
        position: tailoredPosition,
        data: tailoredAgentResult.tailoredResumeData,
        resume_type: 'tailored',
        parent_resume_id: resume.id,
      });
      savedTailoredResume = await this.resumeRepository.save(newRecord);
      this.logger.log(
        `Created new tailored resume ${savedTailoredResume.id} for user ${user.id}`,
      );
    }

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
      matchedKeywords: tailoredAnalysis.matchedKeywords?.length
        ? tailoredAnalysis.matchedKeywords
        : originalAnalysis.matchedKeywords,
      missingKeywords: tailoredAnalysis.missingKeywords?.length
        ? tailoredAnalysis.missingKeywords
        : originalAnalysis.missingKeywords,
      matchedSkills: tailoredAnalysis.matchedSkills?.length
        ? tailoredAnalysis.matchedSkills
        : originalAnalysis.matchedSkills,
      missingSkills: tailoredAnalysis.missingSkills?.length
        ? tailoredAnalysis.missingSkills
        : originalAnalysis.missingSkills,
      resumeId: resume.id,
      tailoredResumeId: savedTailoredResume.id,
      resumeName: resume.name,
      position: tailoredPosition,
      tailoredAt: savedTailoredResume.updated_at
        ? savedTailoredResume.updated_at.toISOString()
        : new Date().toISOString(),
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
    // Keep top-level position synchronized with basic section jobTitle
    const basicSection = Object.values(dto.tailoredData?.sections || {}).find(
      (sec: any) => sec?.type === 'basic',
    );
    if ((basicSection as any)?.data?.jobTitle) {
      resume.position = (basicSection as any).data.jobTitle;
    }
    resume.updated_at = new Date();

    const saved = await this.resumeRepository.save(resume);
    this.logger.log(`Successfully applied tailored resume ${resume.id} for user ${user.id}`);
    return saved;
  }

  /**
   * Retrieves ATS evaluation history for an authenticated user, optionally filtered by resume.
   */
  async getEvaluationHistory(
    userIdentifier: string | number,
    resumeId?: string,
    limit: number = 20,
  ): Promise<AtsEvaluation[]> {
    const user = await this.resolveUser(userIdentifier);

    const query = this.atsEvaluationRepository
      .createQueryBuilder('eval')
      .leftJoinAndSelect('eval.resume', 'resume')
      .where('eval.userId = :userId', { userId: user.id })
      .orderBy('eval.createdAt', 'DESC')
      .take(Math.min(Math.max(1, limit), 50));

    if (resumeId) {
      query.andWhere('eval.resumeId = :resumeId', { resumeId });
    }

    return query.getMany();
  }

  /**
   * Retrieves a specific saved ATS evaluation by its UUID, enforcing user ownership.
   */
  async getEvaluationById(
    userIdentifier: string | number,
    evaluationId: string,
  ): Promise<AtsEvaluation> {
    const user = await this.resolveUser(userIdentifier);

    const evaluation = await this.atsEvaluationRepository.findOne({
      where: { id: evaluationId },
      relations: ['resume'],
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${evaluationId} was not found`);
    }

    if (evaluation.userId !== user.id) {
      throw new ForbiddenException('You do not have permission to view this evaluation');
    }

    return evaluation;
  }

  /**
   * Deletes a saved ATS evaluation record, enforcing user ownership.
   */
  async deleteEvaluation(
    userIdentifier: string | number,
    evaluationId: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.resolveUser(userIdentifier);

    const evaluation = await this.atsEvaluationRepository.findOne({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${evaluationId} was not found`);
    }

    if (evaluation.userId !== user.id) {
      throw new ForbiddenException('You do not have permission to delete this evaluation');
    }

    await this.atsEvaluationRepository.remove(evaluation);
    this.logger.log(`Deleted ATS evaluation ${evaluationId} for user ${user.id}`);
    return { success: true, message: 'Evaluation deleted successfully' };
  }
}


