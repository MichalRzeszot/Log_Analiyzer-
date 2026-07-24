/**
 * Remediation Repository - Data access layer for RemediationAction entity
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { RemediationAction } from '../models/RemediationAction';
import { NotFoundError, DatabaseError } from '../utils/errors';
import logger from '../utils/logger';

export class RemediationRepository {
  private repository: Repository<RemediationAction>;

  constructor() {
    this.repository = AppDataSource.getRepository(RemediationAction);
  }

  /**
   * Find remediation action by ID
   */
  async findById(id: number): Promise<RemediationAction | null> {
    try {
      return await this.repository.findOne({
        where: { id },
        relations: ['analysis', 'user'],
      });
    } catch (error) {
      logger.error(`Error finding remediation action by ID ${id}:`, error);
      throw new DatabaseError('Failed to find remediation action');
    }
  }

  /**
   * Create new remediation action
   */
  async create(data: {
    analysisId: number;
    userId: number;
    actionType: string;
    actionDescription: string;
    parameters?: Record<string, any>;
  }): Promise<RemediationAction> {
    try {
      const action = this.repository.create({
        analysisId: data.analysisId,
        userId: data.userId,
        actionType: data.actionType,
        actionDescription: data.actionDescription,
        parameters: data.parameters || null,
        status: 'pending',
        executedAt: null,
        result: null,
      });
      return await this.repository.save(action);
    } catch (error) {
      logger.error('Error creating remediation action:', error);
      throw new DatabaseError('Failed to create remediation action');
    }
  }

  /**
   * Update remediation action
   */
  async update(id: number, data: Partial<RemediationAction>): Promise<RemediationAction> {
    try {
      const action = await this.findById(id);
      if (!action) {
        throw new NotFoundError('Remediation action');
      }
      Object.assign(action, data);
      return await this.repository.save(action);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error(`Error updating remediation action ${id}:`, error);
      throw new DatabaseError('Failed to update remediation action');
    }
  }

  /**
   * Get remediation actions by analysis
   */
  async getByAnalysisId(analysisId: number): Promise<RemediationAction[]> {
    try {
      return await this.repository.find({
        where: { analysisId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      logger.error(`Error getting remediation actions for analysis ${analysisId}:`, error);
      throw new DatabaseError('Failed to fetch remediation actions');
    }
  }

  /**
   * Get remediation actions by user with pagination
   */
  async getByUserId(
    userId: number,
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<[RemediationAction[], number]> {
    try {
      const skip = (page - 1) * limit;
      const query = this.repository.createQueryBuilder('action')
        .where('action.userId = :userId', { userId })
        .leftJoinAndSelect('action.analysis', 'analysis')
        .orderBy('action.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      if (status) {
        query.andWhere('action.status = :status', { status });
      }

      return await query.getManyAndCount();
    } catch (error) {
      logger.error(`Error getting remediation actions for user ${userId}:`, error);
      throw new DatabaseError('Failed to fetch remediation actions');
    }
  }

  /**
   * Get actions by status
   */
  async getByStatus(status: string, limit: number = 50): Promise<RemediationAction[]> {
    try {
      return await this.repository.find({
        where: { status: status as any },
        relations: ['analysis', 'user'],
        take: limit,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      logger.error(`Error getting remediation actions by status ${status}:`, error);
      throw new DatabaseError('Failed to fetch remediation actions');
    }
  }

  /**
   * Approve remediation action
   */
  async approve(id: number): Promise<RemediationAction> {
    return this.update(id, { status: 'approved' as any });
  }

  /**
   * Mark action as executed
   */
  async markExecuted(id: number, result: Record<string, any>): Promise<RemediationAction> {
    return this.update(id, {
      status: 'executed' as any,
      executedAt: new Date(),
      result,
    });
  }

  /**
   * Mark action as failed
   */
  async markFailed(id: number, error: string): Promise<RemediationAction> {
    return this.update(id, {
      status: 'failed' as any,
      result: { error },
    });
  }

  /**
   * Delete remediation action
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      logger.error(`Error deleting remediation action ${id}:`, error);
      throw new DatabaseError('Failed to delete remediation action');
    }
  }
}

export default new RemediationRepository();
