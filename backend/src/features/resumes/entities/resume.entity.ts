import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('resumes')
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  user_id!: number;

  @Column({ length: 255, default: 'Untitled Resume' })
  name!: string;

  @Column({ length: 255, default: 'General' })
  position!: string;

  @Column({ type: 'jsonb' })
  data!: Record<string, any>;

  @Column({
    name: 'resume_type',
    type: 'varchar',
    length: 50,
    default: 'base',
  })
  resume_type!: 'base' | 'tailored';

  @Column({ name: 'parent_resume_id', type: 'uuid', nullable: true })
  parent_resume_id?: string | null;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;

  @ManyToOne(() => User, (user) => user.resumes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
