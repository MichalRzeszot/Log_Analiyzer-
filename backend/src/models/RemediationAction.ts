/**
 * RemediationAction entity - represents automated remediation actions
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  ForeignKey,
} from 'typeorm';
import { User } from './User';
import { Analysis } from './Analysis';

@Entity('remediation_actions')
@Index(['analysisId'])
@Index(['userId'])
@Index(['status'])
export class RemediationAction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  @ForeignKey(() => Analysis)
  analysisId: number;

  @Column({ type: 'integer' })
  @ForeignKey(() => User)
  userId: number;

  @Column({ type: 'varchar', length: 100 })
  actionType: string;
  // Examples: 'restart_service', 'clear_cache', 'update_config', 'restart_server', etc.

  @Column({ type: 'text' })
  actionDescription: string;

  @Column({ type: 'jsonb', nullable: true })
  parameters: Record<string, any> | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'executing' | 'executed' | 'failed';

  @Column({ type: 'timestamp', nullable: true })
  executedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Analysis, (analysis) => analysis.remediationActions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'analysisId' })
  analysis: Analysis;

  @ManyToOne(() => User, (user) => user.remediationActions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
