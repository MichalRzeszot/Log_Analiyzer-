/**
 * Audit Log Repository - Data access layer for AuditLog entity
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { AuditLog } from '../models/AuditLog';
import { DatabaseError } from '../utils/errors';
import logger from '../utils/logger';

export class AuditLogRepository {
  private repository: Repository<AuditLog>;

  constructor() {
    this.repository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * Create audit log entry
   */
  async log(data: {
    userId?: number | null;
    action: string;
    resourceType?: string;
    resourceId?: number;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, any>;
  }): Promise<AuditLog> {
    try {
      const auditLog = this.repository.create({
        userId: data.userId || null,
        action: data.action,
        resourceType: data.resourceType || null,
        resourceId: data.resourceId || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        details: data.details || null,
      });
      return await this.repository.save(auditLog);
    } catch (error) {
      logger.error('Error creating audit log:', error);
      throw new DatabaseError('Failed to create audit log');
    }
  }

  /**
   * Get audit logs by user with pagination
   */
  async getByUserId(
    userId: number,
    page: number = 1,
    limit: number = 50,
  ): Promise<[AuditLog[], number]> {
    try {
      const skip = (page - 1) * limit;
      return await this.repository.findAndCount({
        where: { userId },
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      logger.error(`Error getting audit logs for user ${userId}:`, error);
      throw new DatabaseError('Failed to fetch audit logs');
    }
  }

  /**
   * Get audit logs by action
   */
  async getByAction(action: string, limit: number = 100): Promise<AuditLog[]> {
    try {
      return await this.repository.find({
        where: { action },
        take: limit,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      logger.error(`Error getting audit logs for action ${action}:`, error);
      throw new DatabaseError('Failed to fetch audit logs');
    }
  }

  /**
   * Get all audit logs with pagination
   */
  async getAll(page: number = 1, limit: number = 50): Promise<[AuditLog[], number]> {
    try {
      const skip = (page - 1) * limit;
      return await this.repository.findAndCount({
        skip,
        take: limit,
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      logger.error('Error getting all audit logs:', error);
      throw new DatabaseError('Failed to fetch audit logs');
    }
  }

  /**
   * Get recent audit logs
   */
  async getRecent(hours: number = 24, limit: number = 100): Promise<AuditLog[]> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      return await this.repository.find({
        where: { createdAt: >= since as any },
        take: limit,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      logger.error('Error getting recent audit logs:', error);
      throw new DatabaseError('Failed to fetch audit logs');
    }
  }

  /**
   * Delete old audit logs
   */
  async deleteOlderThan(days: number): Promise<number> {
    try {
      const before = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const result = await this.repository
        .createQueryBuilder()
        .delete()
        .where('createdAt < :before', { before })
        .execute();
      return result.affected || 0;
    } catch (error) {
      logger.error(`Error deleting audit logs older than ${days} days:`, error);
      throw new DatabaseError('Failed to delete audit logs');
    }
  }
}

export default new AuditLogRepository();
