/**
 * Remediation Controller - Handles remediation endpoints
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { RemediationService } from '../services/RemediationService';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError } from '../utils/errors';

export class RemediationController {
  /**
   * GET /remediations/pending
   * Get pending remediations for user
   */
  static getPendingRemediations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await RemediationService.getPendingRemediations(req.user.id, page, limit);

    res.status(200).json({
      success: true,
      data: result.actions,
      pagination: {
        total: result.total,
        page: result.page,
        limit,
        pages: result.pages,
      },
    });
  });

  /**
   * POST /remediations/:id/approve
   * Approve remediation action
   */
  static approveRemediation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { id } = req.params;
    const result = await RemediationService.approveRemediation(parseInt(id, 10), req.user.id);

    res.status(200).json({
      success: true,
      message: 'Remediation approved',
      data: result,
    });
  });

  /**
   * POST /remediations/:id/reject
   * Reject remediation action
   */
  static rejectRemediation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { reason } = req.body;
    const result = await RemediationService.rejectRemediation(parseInt(id, 10), req.user.id, reason);

    res.status(200).json({
      success: true,
      message: 'Remediation rejected',
      data: result,
    });
  });

  /**
   * POST /remediations/:id/execute
   * Execute remediation action
   */
  static executeRemediation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { id } = req.params;
    const result = await RemediationService.executeRemediation(parseInt(id, 10), req.user.id);

    res.status(200).json({
      success: true,
      message: 'Remediation executed',
      data: result,
    });
  });

  /**
   * GET /analyses/:analysisId/remediations
   * Get remediation history for analysis
   */
  static getRemediationHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { analysisId } = req.params;
    const history = await RemediationService.getRemediationHistory(parseInt(analysisId, 10), req.user.id);

    res.status(200).json({
      success: true,
      data: history,
    });
  });
}
