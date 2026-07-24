/**
 * AuditLog entity - represents security and action audit logs
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

@Entity('audit_logs')
@Index(['userId'])
@Index(['createdAt'])
@Index(['resourceType'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: true })
  @ForeignKey(() => User)
  userId: number | null;

  @Column({ type: 'varchar', length: 255 })
  action: string;
  // Examples: 'LOGIN', 'LOGOUT', 'UPLOAD_LOG', 'ANALYZE_LOG', 'EXECUTE_REMEDIATION', etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  resourceType: string | null;
  // Examples: 'User', 'Log', 'Analysis', 'RemediationAction'

  @Column({ type: 'integer', nullable: true })
  resourceId: number | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.auditLogs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User | null;
}
