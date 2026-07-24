/**
 * Analysis Controller - Handles analysis endpoints
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { LogAnalysisService } from '../services/LogAnalysisService';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError } from '../utils/errors';

export class AnalysisController {
  /**
   * GET /analyses
   * Get user's analyses with pagination
   */
  static getAnalyses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const minConfidence = req.query.minConfidence ? parseFloat(req.query.minConfidence as string) : undefined;

    const result = await LogAnalysisService.getUserAnalyses(req.user.id, page, limit, minConfidence);

    res.status(200).json({
      success: true,
      data: result.analyses,
      pagination: {
        total: result.total,
        page: result.page,
        limit,
        pages: result.pages,
      },
    });
  });

  /**
   * GET /analyses/:id
   * Get analysis details
   */
  static getAnalysisById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { id } = req.params;
    const analysis = await LogAnalysisService.getAnalysis(parseInt(id, 10), req.user.id);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  });
}
