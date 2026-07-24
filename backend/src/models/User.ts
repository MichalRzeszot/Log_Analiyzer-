/**
 * User entity - represents application users
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Log } from './Log';
import { Analysis } from './Analysis';
import { RemediationAction } from './RemediationAction';
import { AuditLog } from './AuditLog';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', length: 50, default: 'user' })
  role: 'admin' | 'user';

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];

  @OneToMany(() => Analysis, (analysis) => analysis.user)
  analyses: Analysis[];

  @OneToMany(() => RemediationAction, (action) => action.user)
  remediationActions: RemediationAction[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];
}
