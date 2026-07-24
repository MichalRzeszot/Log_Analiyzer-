/**
 * Authentication Routes
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { validationSchemas } from '../utils/validators';

const router = Router();

// Public routes
router.post('/register', validate(validationSchemas.register), AuthController.register);
router.post('/login', validate(validationSchemas.login), AuthController.login);
router.post('/refresh', AuthController.refreshToken);

// Protected routes
router.get('/me', authenticateToken, AuthController.getCurrentUser);
router.post('/logout', authenticateToken, AuthController.logout);

export default router;
