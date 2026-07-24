/**
 * Report Controller - Handles report endpoints
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ReportService } from '../services/ReportService';
import { asyncHandler } from '../middleware/errorHandler';

export class ReportController {
  /**
   * POST /reports/:analysisId/generate
   * Generate PDF report
   */
  static generateReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { analysisId } = req.params;
    const reportFilename = await ReportService.generatePDFReport(parseInt(analysisId, 10), req.user.id);

    res.status(200).json({
      success: true,
      message: 'Report generated successfully',
      data: {
        reportFilename,
        downloadUrl: `/api/reports/${reportFilename}/download`,
      },
    });
  });

  /**
   * GET /reports/:reportFilename/download
   * Download PDF report
   */
  static downloadReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { reportFilename } = req.params;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportFilename}"`);

    // Get file stream and pipe
    const stream = ReportService.getReportStream(reportFilename);
    stream.pipe(res);
  });
}
