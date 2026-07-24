/**
 * Log Repository - Data access layer for Log entity
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Log } from '../models/Log';
import { NotFoundError, DatabaseError } from '../utils/errors';
import logger from '../utils/logger';

export class LogRepository {
  private repository: Repository<Log>;

  constructor() {
    this.repository = AppDataSource.getRepository(Log);
  }

  /**
   * Find log by ID with relations
   */
  async findById(id: number): Promise<Log | null> {
    try {
      return await this.repository.findOne({
        where: { id },
        relations: ['user', 'analysis'],
      });
    } catch (error) {
      logger.error(`Error finding log by ID ${id}:`, error);
      throw new DatabaseError('Failed to find log');
    }
  }

  /**
   * Create new log
   */
  async create(data: {
    userId: number;
    fileName: string;
    fileType: 'txt' | 'log' | 'json';
    content: string;
    filePath?: string;
    fileSize?: number;
  }): Promise<Log> {
    try {
      const log = this.repository.create({
        userId: data.userId,
        fileName: data.fileName,
        fileType: data.fileType,
        content: data.content,
        filePath: data.filePath || null,
        fileSize: data.fileSize || null,
        status: 'uploaded',
        errorMessage: null,
      });
      return await this.repository.save(log);
    } catch (error) {
      logger.error('Error creating log:', error);
      throw new DatabaseError('Failed to create log');
    }
  }

  /**
   * Update log
   */
  async update(id: number, data: Partial<Log>): Promise<Log> {
    try {
      const log = await this.findById(id);
      if (!log) {
        throw new NotFoundError('Log');
      }
      Object.assign(log, data);
      return await this.repository.save(log);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error(`Error updating log ${id}:`, error);
      throw new DatabaseError('Failed to update log');
    }
  }

  /**
   * Get logs by user with pagination
   */
  async getByUserId(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<[Log[], number]> {
    try {
      const skip = (page - 1) * limit;
      return await this.repository.findAndCount({
        where: { userId },
        skip,
        take: limit,
        relations: ['analysis'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      logger.error(`Error getting logs for user ${userId}:`, error);
      throw new DatabaseError('Failed to fetch logs');
    }
  }

  /**
   * Get logs by status
   */
  async getByStatus(status: string, limit: number = 50): Promise<Log[]> {
    try {
      return await this.repository.find({
        where: { status: status as any },
        take: limit,
        order: { createdAt: 'ASC' },
      });
    } catch (error) {
      logger.error(`Error getting logs by status ${status}:`, error);
      throw new DatabaseError('Failed to fetch logs');
    }
  }

  /**
   * Delete log
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      logger.error(`Error deleting log ${id}:`, error);
      throw new DatabaseError('Failed to delete log');
    }
  }

  /**
   * Count logs by user
   */
  async countByUserId(userId: number): Promise<number> {
    try {
      return await this.repository.count({ where: { userId } });
    } catch (error) {
      logger.error(`Error counting logs for user ${userId}:`, error);
      throw new DatabaseError('Failed to count logs');
    }
  }
}

export default new LogRepository();
