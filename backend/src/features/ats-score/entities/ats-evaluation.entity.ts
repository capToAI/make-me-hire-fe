import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Resume } from '../../resumes/entities/resume.entity';

/**
 * Entity representing a historical ATS evaluation record.
 * Captures job details, match metrics, strengths, gaps, and recommendations.
 */
@Entity('ats_evaluations')
export class AtsEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id' })
  userId!: number;

  @Index()
  @Column({ name: 'resume_id', type: 'uuid' })
  resumeId!: string;

  @Column({ name: 'job_title', length: 255, default: 'Target Role' })
  jobTitle!: string;

  @Column({ name: 'job_description', type: 'text' })
  jobDescription!: string;

  @Column({ type: 'int' })
  score!: number;

  @Column({ length: 50 })
  rank!: string;

  @Column({ type: 'text', nullable: true })
  summary!: string;

  @Column({ name: 'matched_keywords', type: 'jsonb', default: () => "'[]'" })
  matchedKeywords!: string[];

  @Column({ name: 'missing_keywords', type: 'jsonb', default: () => "'[]'" })
  missingKeywords!: string[];

  @Column({ name: 'matched_skills', type: 'jsonb', default: () => "'[]'" })
  matchedSkills!: string[];

  @Column({ name: 'missing_skills', type: 'jsonb', default: () => "'[]'" })
  missingSkills!: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  strengths!: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  improvements!: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  recommendations!: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Resume, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resume_id' })
  resume!: Resume;
}
