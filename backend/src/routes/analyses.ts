/**
 * Analysis Routes
 */

import { Router } from 'express';
import { AnalysisController } from '../controllers/AnalysisController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all analyses
router.get('/', AnalysisController.getAnalyses);

// Get analysis by ID
router.get('/:id', AnalysisController.getAnalysisById);

export default router;
