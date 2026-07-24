/**
 * Report Routes
 */

import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Generate report
router.post('/:analysisId/generate', ReportController.generateReport);

// Download report
router.get('/:reportFilename/download', ReportController.downloadReport);

export default router;
