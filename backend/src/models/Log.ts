/**
 * Log entity - represents uploaded log files
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
  ForeignKey,
} from 'typeorm';
import { User } from './User';
import { Analysis } from './Analysis';

@Entity('logs')
@Index(['userId'])
@Index(['createdAt'])
@Index(['status'])
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  @ForeignKey(() => User)
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string | null;

  @Column({ type: 'varchar', length: 10 })
  fileType: 'txt' | 'log' | 'json';

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'integer', nullable: true })
  fileSize: number | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'uploaded',
  })
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'error';

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => Analysis, (analysis) => analysis.log, { nullable: true })
  analysis: Analysis | null;
}
