/**
 * Remediation Routes
 */

import { Router } from 'express';
import { RemediationController } from '../controllers/RemediationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get pending remediations
router.get('/pending', RemediationController.getPendingRemediations);

// Approve remediation
router.post('/:id/approve', RemediationController.approveRemediation);

// Reject remediation
router.post('/:id/reject', RemediationController.rejectRemediation);

// Execute remediation
router.post('/:id/execute', RemediationController.executeRemediation);

// Get remediation history for analysis
router.get('/analysis/:analysisId/history', RemediationController.getRemediationHistory);

export default router;
