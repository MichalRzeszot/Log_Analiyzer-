/**
 * Remediation Service - Business logic for automated remediation
 */

import { RemediationRepository } from '../repositories/RemediationRepository';
import { AnalysisRepository } from '../repositories/AnalysisRepository';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { NotFoundError, ValidationError, InternalServerError } from '../utils/errors';
import logger from '../utils/logger';

export class RemediationService {
  /**
   * Get pending remediations for user
   */
  async getPendingRemediations(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ actions: any[]; total: number; page: number; pages: number }> {
    try {
      const [actions, total] = await RemediationRepository.getByUserId(
        userId,
        page,
        limit,
        'pending',
      );

      return {
        actions: actions.map((a) => ({
          id: a.id,
          analysisId: a.analysisId,
          actionType: a.actionType,
          actionDescription: a.actionDescription,
          priority: this.getPriorityFromAction(a),
          createdAt: a.createdAt,
        })),
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Error getting pending remediations for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Approve remediation action
   */
  async approveRemediation(actionId: number, userId: number): Promise<any> {
    try {
      // Get action
      const action = await RemediationRepository.findById(actionId);
      if (!action) {
        throw new NotFoundError('Remediation action');
      }

      // Check ownership
      if (action.userId !== userId) {
        throw new ValidationError('You do not have permission to approve this action');
      }

      // Check status
      if (action.status !== 'pending') {
        throw new ValidationError(`Action cannot be approved. Current status: ${action.status}`);
      }

      // Update status
      const updated = await RemediationRepository.approve(actionId);

      // Log audit
      await AuditLogRepository.log({
        userId,
        action: 'APPROVE_REMEDIATION',
        resourceType: 'RemediationAction',
        resourceId: actionId,
        details: { actionType: action.actionType },
      });

      logger.info(`Remediation action ${actionId} approved by user ${userId}`);

      return {
        id: updated.id,
        actionType: updated.actionType,
        status: updated.status,
        updatedAt: new Date(),
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      logger.error(`Error approving remediation ${actionId}:`, error);
      throw error;
    }
  }

  /**
   * Reject remediation action
   */
  async rejectRemediation(actionId: number, userId: number, reason?: string): Promise<any> {
    try {
      // Get action
      const action = await RemediationRepository.findById(actionId);
      if (!action) {
        throw new NotFoundError('Remediation action');
      }

      // Check ownership
      if (action.userId !== userId) {
        throw new ValidationError('You do not have permission to reject this action');
      }

      // Delete action (rejection)
      await RemediationRepository.delete(actionId);

      // Log audit
      await AuditLogRepository.log({
        userId,
        action: 'REJECT_REMEDIATION',
        resourceType: 'RemediationAction',
        resourceId: actionId,
        details: { reason },
      });

      logger.info(`Remediation action ${actionId} rejected by user ${userId}`);

      return { success: true, message: 'Remediation action rejected' };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      logger.error(`Error rejecting remediation ${actionId}:`, error);
      throw error;
    }
  }

  /**
   * Execute remediation action (simulated)
   */
  async executeRemediation(actionId: number, userId: number): Promise<any> {
    try {
      // Get action
      const action = await RemediationRepository.findById(actionId);
      if (!action) {
        throw new NotFoundError('Remediation action');
      }

      // Check ownership
      if (action.userId !== userId) {
        throw new ValidationError('You do not have permission to execute this action');
      }

      // Check status
      if (action.status !== 'approved') {
        throw new ValidationError('Action must be approved before execution');
      }

      // Simulate execution
      const result = this.simulateExecution(action);

      // Update status
      const updated = await RemediationRepository.markExecuted(actionId, result);

      // Log audit
      await AuditLogRepository.log({
        userId,
        action: 'EXECUTE_REMEDIATION',
        resourceType: 'RemediationAction',
        resourceId: actionId,
        details: { result },
      });

      logger.info(`Remediation action ${actionId} executed successfully`);

      return {
        id: updated.id,
        actionType: updated.actionType,
        status: updated.status,
        result: updated.result,
        executedAt: updated.executedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      logger.error(`Error executing remediation ${actionId}:`, error);
      throw error;
    }
  }

  /**
   * Get remediation history for analysis
   */
  async getRemediationHistory(analysisId: number, userId: number): Promise<any[]> {
    try {
      // Verify analysis exists and belongs to user
      const analysis = await AnalysisRepository.findById(analysisId);
      if (!analysis) {
        throw new NotFoundError('Analysis');
      }

      if (analysis.userId !== userId) {
        throw new ValidationError('You do not have permission to view this analysis');
      }

      const actions = await RemediationRepository.getByAnalysisId(analysisId);

      return actions.map((a) => ({
        id: a.id,
        actionType: a.actionType,
        actionDescription: a.actionDescription,
        status: a.status,
        priority: this.getPriorityFromAction(a),
        executedAt: a.executedAt,
        result: a.result,
        createdAt: a.createdAt,
      }));
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      logger.error(`Error getting remediation history for analysis ${analysisId}:`, error);
      throw error;
    }
  }

  /**
   * Simulate remediation execution
   */
  private simulateExecution(action: any): Record<string, any> {
    // In production, this would actually execute the remediation
    return {
      success: true,
      message: `Successfully executed ${action.actionType}`,
      timestamp: new Date().toISOString(),
      details: {
        command: action.actionType,
        parameters: action.parameters,
      },
    };
  }

  /**
   * Get priority from action's analysis
   */
  private getPriorityFromAction(action: any): string {
    // Extract from proposed actions if available
    return 'medium';
  }
}

export default new RemediationService();
