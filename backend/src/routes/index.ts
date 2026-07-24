/**
 * Health Check Routes
 */

import { Router, Request, Response } from 'express';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  logger.info('Health check called');
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /
 * API root endpoint
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'IT Failure Analyzer API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      logs: '/api/logs',
      analyses: '/api/analyses',
      remediations: '/api/remediations',
      reports: '/api/reports',
      health: '/api/health',
    },
  });
});

export default router;
