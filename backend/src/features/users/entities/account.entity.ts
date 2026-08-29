import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('accounts')
@Unique(['provider', 'provider_account_id'])
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  user_id!: number;

  @Column({ length: 50 })
  provider!: string;

  @Column({ name: 'provider_account_id' })
  provider_account_id!: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
