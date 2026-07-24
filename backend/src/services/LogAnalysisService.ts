/**
 * Log Analysis Service - Business logic for analyzing logs with AI
 */

import { LogRepository } from '../repositories/LogRepository';
import { AnalysisRepository } from '../repositories/AnalysisRepository';
import { RemediationRepository } from '../repositories/RemediationRepository';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { analyzeLogs } from '../config/openai';
import { NotFoundError, ValidationError, InternalServerError } from '../utils/errors';
import logger from '../utils/logger';

export interface AnalysisResult {
  detected_problem: string;
  root_cause: string;
  proposed_actions: Array<{
    action: string;
    type: string;
    parameters?: Record<string, any>;
    priority: 'high' | 'medium' | 'low';
  }>;
  confidence_level: number;
  summary: string;
}

export class LogAnalysisService {
  /**
   * Analyze log and generate recommendations
   */
  async analyzeLog(logId: number, userId: number): Promise<any> {
    const startTime = Date.now();

    try {
      // Get log
      const log = await LogRepository.findById(logId);
      if (!log) {
        throw new NotFoundError('Log');
      }

      // Check ownership
      if (log.userId !== userId) {
        throw new ValidationError('You do not have permission to analyze this log');
      }

      // Update log status
      await LogRepository.update(logId, { status: 'analyzing' });

      // Analyze with OpenAI
      logger.info(`Starting analysis for log ${logId}`);
      const analysisResult: AnalysisResult = await analyzeLogs(log.content);

      // Validate response
      if (!analysisResult.detected_problem || !analysisResult.root_cause) {
        throw new InternalServerError('Invalid analysis response from AI');
      }

      // Create analysis record
      const analysis = await AnalysisRepository.create({
        logId,
        userId,
        detectedProblem: analysisResult.detected_problem,
        rootCause: analysisResult.root_cause,
        confidenceLevel: analysisResult.confidence_level,
        proposedActions: analysisResult.proposed_actions,
        aiResponse: analysisResult,
        analysisTime: Date.now() - startTime,
      });

      // Create remediation actions
      for (const action of analysisResult.proposed_actions) {
        await RemediationRepository.create({
          analysisId: analysis.id,
          userId,
          actionType: action.type,
          actionDescription: action.action,
          parameters: action.parameters,
        });
      }

      // Update log status
      await LogRepository.update(logId, { status: 'analyzed' });

      // Log audit
      await AuditLogRepository.log({
        userId,
        action: 'ANALYZE_LOG',
        resourceType: 'Log',
        resourceId: logId,
        details: {
          analysisId: analysis.id,
          confidenceLevel: analysis.confidenceLevel,
        },
      });

      logger.info(
        `Analysis completed for log ${logId} with confidence ${analysis.confidenceLevel}`,
      );

      return {
        id: analysis.id,
        logId: analysis.logId,
        detectedProblem: analysis.detectedProblem,
        rootCause: analysis.rootCause,
        confidenceLevel: analysis.confidenceLevel,
        proposedActions: analysis.proposedActions,
        analysisTime: analysis.analysisTime,
        createdAt: analysis.createdAt,
      };
    } catch (error) {
      // Update log with error
      try {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await LogRepository.update(logId, {
          status: 'error',
          errorMessage,
        });
      } catch (updateError) {
        logger.error('Error updating log status:', updateError);
      }

      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }
      logger.error(`Error analyzing log ${logId}:`, error);
      throw new InternalServerError('Failed to analyze log');
    }
  }

  /**
   * Get analysis details
   */
  async getAnalysis(analysisId: number, userId: number): Promise<any> {
    try {
      const analysis = await AnalysisRepository.findById(analysisId);
      if (!analysis) {
        throw new NotFoundError('Analysis');
      }

      // Check ownership
      if (analysis.userId !== userId) {
        throw new ValidationError('You do not have permission to view this analysis');
      }

      return {
        id: analysis.id,
        logId: analysis.logId,
        detectedProblem: analysis.detectedProblem,
        rootCause: analysis.rootCause,
        confidenceLevel: analysis.confidenceLevel,
        proposedActions: analysis.proposedActions,
        remediationActions: analysis.remediationActions,
        analysisTime: analysis.analysisTime,
        createdAt: analysis.createdAt,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      logger.error(`Error getting analysis ${analysisId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's analyses with pagination
   */
  async getUserAnalyses(
    userId: number,
    page: number = 1,
    limit: number = 10,
    minConfidence?: number,
  ): Promise<{ analyses: any[]; total: number; page: number; pages: number }> {
    try {
      const [analyses, total] = await AnalysisRepository.getByUserId(
        userId,
        page,
        limit,
        minConfidence,
      );

      return {
        analyses: analyses.map((a) => ({
          id: a.id,
          logId: a.logId,
          detectedProblem: a.detectedProblem,
          confidenceLevel: a.confidenceLevel,
          status: a.status,
          createdAt: a.createdAt,
        })),
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Error getting analyses for user ${userId}:`, error);
      throw error;
    }
  }
}

export default new LogAnalysisService();
