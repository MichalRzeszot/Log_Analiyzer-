/**
 * Analysis Repository - Data access layer for Analysis entity
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Analysis } from '../models/Analysis';
import { NotFoundError, DatabaseError } from '../utils/errors';
import logger from '../utils/logger';

export class AnalysisRepository {
  private repository: Repository<Analysis>;

  constructor() {
    this.repository = AppDataSource.getRepository(Analysis);
  }

  /**
   * Find analysis by ID with relations
   */
  async findById(id: number): Promise<Analysis | null> {
    try {
      return await this.repository.findOne({
        where: { id },
        relations: ['log', 'user', 'remediationActions'],
      });
    } catch (error) {
      logger.error(`Error finding analysis by ID ${id}:`, error);
      throw new DatabaseError('Failed to find analysis');
    }
  }

  /**
   * Find analysis by log ID
   */
  async findByLogId(logId: number): Promise<Analysis | null> {
    try {
      return await this.repository.findOne({
        where: { logId },
        relations: ['log', 'user', 'remediationActions'],
      });
    } catch (error) {
      logger.error(`Error finding analysis by log ID ${logId}:`, error);
      throw new DatabaseError('Failed to find analysis');
    }
  }

  /**
   * Create new analysis
   */
  async create(data: {
    logId: number;
    userId: number;
    detectedProblem: string;
    rootCause: string;
    confidenceLevel: number;
    proposedActions: any[];
    aiResponse?: Record<string, any>;
    analysisTime?: number;
  }): Promise<Analysis> {
    try {
      const analysis = this.repository.create({
        logId: data.logId,
        userId: data.userId,
        detectedProblem: data.detectedProblem,
        rootCause: data.rootCause,
        confidenceLevel: data.confidenceLevel,
        proposedActions: data.proposedActions,
        aiResponse: data.aiResponse || null,
        analysisTime: data.analysisTime || null,
        status: 'completed',
        errorMessage: null,
      });
      return await this.repository.save(analysis);
    } catch (error) {
      logger.error('Error creating analysis:', error);
      throw new DatabaseError('Failed to create analysis');
    }
  }

  /**
   * Update analysis
   */
  async update(id: number, data: Partial<Analysis>): Promise<Analysis> {
    try {
      const analysis = await this.findById(id);
      if (!analysis) {
        throw new NotFoundError('Analysis');
      }
      Object.assign(analysis, data);
      return await this.repository.save(analysis);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error(`Error updating analysis ${id}:`, error);
      throw new DatabaseError('Failed to update analysis');
    }
  }

  /**
   * Get analyses by user with pagination
   */
  async getByUserId(
    userId: number,
    page: number = 1,
    limit: number = 10,
    minConfidence?: number,
  ): Promise<[Analysis[], number]> {
    try {
      const skip = (page - 1) * limit;
      const query = this.repository.createQueryBuilder('analysis')
        .where('analysis.userId = :userId', { userId })
        .leftJoinAndSelect('analysis.log', 'log')
        .leftJoinAndSelect('analysis.remediationActions', 'remediationActions')
        .orderBy('analysis.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      if (minConfidence !== undefined) {
        query.andWhere('analysis.confidenceLevel >= :minConfidence', { minConfidence });
      }

      return await query.getManyAndCount();
    } catch (error) {
      logger.error(`Error getting analyses for user ${userId}:`, error);
      throw new DatabaseError('Failed to fetch analyses');
    }
  }

  /**
   * Get analyses by status
   */
  async getByStatus(status: string, limit: number = 50): Promise<Analysis[]> {
    try {
      return await this.repository.find({
        where: { status: status as any },
        relations: ['log', 'user'],
        take: limit,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      logger.error(`Error getting analyses by status ${status}:`, error);
      throw new DatabaseError('Failed to fetch analyses');
    }
  }

  /**
   * Get high confidence analyses
   */
  async getHighConfidence(minConfidence: number = 0.8, limit: number = 50): Promise<Analysis[]> {
    try {
      return await this.repository
        .createQueryBuilder('analysis')
        .where('analysis.confidenceLevel >= :minConfidence', { minConfidence })
        .leftJoinAndSelect('analysis.log', 'log')
        .orderBy('analysis.createdAt', 'DESC')
        .take(limit)
        .getMany();
    } catch (error) {
      logger.error('Error getting high confidence analyses:', error);
      throw new DatabaseError('Failed to fetch analyses');
    }
  }

  /**
   * Delete analysis
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.repository.delete(id);
      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      logger.error(`Error deleting analysis ${id}:`, error);
      throw new DatabaseError('Failed to delete analysis');
    }
  }
}

export default new AnalysisRepository();
