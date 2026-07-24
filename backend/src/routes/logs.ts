/**
 * Log Routes
 */

import { Router } from 'express';
import { LogController } from '../controllers/LogController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { validationSchemas } from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Upload log
router.post('/upload', validate(validationSchemas.uploadLog), LogController.uploadLog);

// Get all logs
router.get('/', LogController.getLogs);

// Get log by ID
router.get('/:id', LogController.getLogById);

// Analyze log
router.post('/:id/analyze', LogController.analyzeLog);

// Delete log
router.delete('/:id', LogController.deleteLog);

export default router;
