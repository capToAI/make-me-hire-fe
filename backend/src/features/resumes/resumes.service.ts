import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Account } from '../users/entities/account.entity';
import { Resume } from './entities/resume.entity';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResumeListItemDto, ResumeResponseDto } from './dto/resume-response.dto';

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);

  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  /**
   * Resolves the authenticated User entity from a numeric ID, email, or Google provider account ID.
   */
  async resolveUser(userIdentifier?: string | number): Promise<User> {
    if (!userIdentifier) {
      throw new UnauthorizedException('Authentication required to access resumes');
    }

    const strId = String(userIdentifier).trim();
    if (!strId) {
      throw new UnauthorizedException('Authentication required to access resumes');
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
   * Automatically extracts Resume Name and Position from ResumeState data.
   */
  private extractResumeMetadata(
    data: any,
    fallbackUserName?: string | null,
  ): { name: string; position: string } {
    let name = '';
    let position = '';

    if (data?.sections && typeof data.sections === 'object') {
      const basicSection = Object.values(data.sections).find(
        (s: any) => s && (s.type === 'basic' || String(s.id).includes('basic')),
      ) as any;

      if (basicSection?.data) {
        const basicName = basicSection.data.name
          ? String(basicSection.data.name).trim()
          : '';
        const basicJobTitle = basicSection.data.jobTitle
          ? String(basicSection.data.jobTitle).trim()
          : '';

        if (basicName) {
          name = `${basicName} Resume`;
        }
        if (basicJobTitle) {
          position = basicJobTitle;
        }
      }
    }

    if (!name) {
      name = fallbackUserName ? `${fallbackUserName} Resume` : 'Untitled Resume';
    }
    if (!position) {
      position = 'General';
    }

    return { name, position };
  }

  /**
   * Creates a new resume belonging to the authenticated user.
   */
  async createResume(
    userIdentifier: string | number,
    dto: CreateResumeDto,
  ): Promise<ResumeResponseDto> {
    const user = await this.resolveUser(userIdentifier);

    const defaultState = {
      sectionOrder: [
        'sec-basic-1',
        'sec-summary-1',
        'sec-skills-1',
        'sec-exp-1',
        'sec-edu-1',
      ],
      sections: {
        'sec-basic-1': {
          id: 'sec-basic-1',
          type: 'basic',
          title: 'Personal Info',
          visible: true,
          data: {
            name: user.name || '',
            jobTitle: dto.position?.trim() || '',
            email: user.email || '',
            phone: '',
            location: '',
            linkedin: '',
            website: '',
          },
        },
        'sec-summary-1': {
          id: 'sec-summary-1',
          type: 'summary',
          title: 'Summary',
          visible: true,
          data: { text: '' },
        },
        'sec-skills-1': {
          id: 'sec-skills-1',
          type: 'skills',
          title: 'Skills',
          visible: true,
          data: { categoryLabel: 'Core Competencies', items: [] },
        },
        'sec-exp-1': {
          id: 'sec-exp-1',
          type: 'experience',
          title: 'Experience',
          visible: true,
          data: { entries: [] },
        },
        'sec-edu-1': {
          id: 'sec-edu-1',
          type: 'education',
          title: 'Education',
          visible: true,
          data: { entries: [] },
        },
      },
    };

    const resumeData =
      dto.data && typeof dto.data === 'object' ? dto.data : defaultState;

    const extracted = this.extractResumeMetadata(resumeData, user.name);
    const resumeName = dto.name?.trim() || extracted.name;
    const resumePosition = dto.position?.trim() || extracted.position;

    const resume = this.resumeRepository.create({
      user_id: user.id,
      name: resumeName,
      position: resumePosition,
      data: resumeData,
    });

    const saved = await this.resumeRepository.save(resume);
    this.logger.log(`Created resume "${saved.name}" (ID: ${saved.id}) for user ID: ${user.id}`);
    return this.mapToResponse(saved);
  }

  /**
   * Retrieves all resumes owned by the authenticated user.
   */
  async getUserResumes(userIdentifier: string | number): Promise<ResumeListItemDto[]> {
    const user = await this.resolveUser(userIdentifier);

    const resumes = await this.resumeRepository.find({
      where: { user_id: user.id },
      order: { updated_at: 'DESC' },
    });

    return resumes.map((resume) => ({
      id: resume.id,
      userId: resume.user_id,
      name: resume.name,
      position: resume.position,
      createdAt: resume.created_at,
      updatedAt: resume.updated_at,
    }));
  }

  /**
   * Retrieves a specific resume ensuring ownership validation.
   */
  async getResumeById(
    userIdentifier: string | number,
    resumeId: string,
  ): Promise<ResumeResponseDto> {
    const user = await this.resolveUser(userIdentifier);

    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${resumeId} was not found`);
    }

    if (resume.user_id !== user.id) {
      this.logger.warn(
        `Unauthorized access attempt: User ${user.id} tried to read Resume ${resumeId} owned by User ${resume.user_id}`,
      );
      throw new ForbiddenException('You do not have permission to view this resume');
    }

    return this.mapToResponse(resume);
  }

  /**
   * Updates an existing resume record with ownership validation.
   */
  async updateResume(
    userIdentifier: string | number,
    resumeId: string,
    dto: UpdateResumeDto,
  ): Promise<ResumeResponseDto> {
    const user = await this.resolveUser(userIdentifier);

    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${resumeId} was not found`);
    }

    if (resume.user_id !== user.id) {
      this.logger.warn(
        `Unauthorized update attempt: User ${user.id} tried to modify Resume ${resumeId} owned by User ${resume.user_id}`,
      );
      throw new ForbiddenException('You do not have permission to modify this resume');
    }

    if (dto.data !== undefined && typeof dto.data === 'object') {
      resume.data = dto.data;

      // Automatically sync Name and Position from the resume data if not explicitly overridden
      const extracted = this.extractResumeMetadata(dto.data, user.name);
      if (dto.name === undefined && extracted.name) {
        resume.name = extracted.name;
      }
      if (dto.position === undefined && extracted.position) {
        resume.position = extracted.position;
      }
    }

    if (dto.name !== undefined) {
      resume.name = dto.name.trim();
    }
    if (dto.position !== undefined) {
      resume.position = dto.position.trim();
    }

    const updated = await this.resumeRepository.save(resume);
    this.logger.log(`Updated resume "${updated.name}" (ID: ${updated.id}) for user ID: ${user.id}`);
    return this.mapToResponse(updated);
  }

  /**
   * Deletes a resume with ownership validation.
   */
  async deleteResume(
    userIdentifier: string | number,
    resumeId: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.resolveUser(userIdentifier);

    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${resumeId} was not found`);
    }

    if (resume.user_id !== user.id) {
      this.logger.warn(
        `Unauthorized delete attempt: User ${user.id} tried to delete Resume ${resumeId} owned by User ${resume.user_id}`,
      );
      throw new ForbiddenException('You do not have permission to delete this resume');
    }

    await this.resumeRepository.remove(resume);
    this.logger.log(`Deleted resume ID: ${resumeId} for user ID: ${user.id}`);
    return { success: true, message: 'Resume successfully deleted' };
  }

  private mapToResponse(resume: Resume): ResumeResponseDto {
    return {
      id: resume.id,
      userId: resume.user_id,
      name: resume.name,
      position: resume.position,
      data: resume.data,
      createdAt: resume.created_at,
      updatedAt: resume.updated_at,
    };
  }
}
