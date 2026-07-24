/**
 * Analysis entity - represents AI analysis results
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
  ForeignKey,
} from 'typeorm';
import { User } from './User';
import { Log } from './Log';
import { RemediationAction } from './RemediationAction';

@Entity('analyses')
@Index(['logId'])
@Index(['userId'])
@Index(['createdAt'])
@Index(['status'])
export class Analysis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  @ForeignKey(() => Log)
  logId: number;

  @Column({ type: 'integer' })
  @ForeignKey(() => User)
  userId: number;

  @Column({ type: 'text' })
  detectedProblem: string;

  @Column({ type: 'text' })
  rootCause: string;

  @Column({ type: 'numeric', precision: 3, scale: 2 })
  confidenceLevel: number; // 0.00 - 1.00

  @Column({ type: 'jsonb' })
  proposedActions: Array<{
    action: string;
    type: string;
    parameters?: Record<string, any>;
    priority: 'high' | 'medium' | 'low';
  }>;

  @Column({ type: 'jsonb', nullable: true })
  aiResponse: Record<string, any> | null;

  @Column({ type: 'integer', nullable: true })
  analysisTime: number | null; // milliseconds

  @Column({
    type: 'varchar',
    length: 50,
    default: 'completed',
  })
  status: 'pending' | 'completed' | 'error';

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @OneToOne(() => Log, (log) => log.analysis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'logId' })
  log: Log;

  @ManyToOne(() => User, (user) => user.analyses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => RemediationAction, (action) => action.analysis)
  remediationActions: RemediationAction[];
}
