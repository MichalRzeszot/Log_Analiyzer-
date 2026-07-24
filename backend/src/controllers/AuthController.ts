/**
 * Authentication Controller - Handles auth endpoints
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AuthService } from '../services/AuthService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import logger from '../utils/logger';

export class AuthController {
  /**
   * POST /auth/register
   * Register new user
   */
  static register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    const result = await AuthService.register({
      email,
      password,
      firstName,
      lastName,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  });

  /**
   * POST /auth/login
   * Login user
   */
  static login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    const result = await AuthService.login({ email, password });

    // Log audit
    await AuditLogRepository.log({
      userId: result.user.id,
      action: 'LOGIN',
      ipAddress,
      userAgent,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  /**
   * POST /auth/refresh
   * Refresh access token
   */
  static refreshToken = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body;

    const result = await AuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: result,
    });
  });

  /**
   * GET /auth/me
   * Get current user
   */
  static getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const user = await AuthService.getCurrentUser(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * POST /auth/logout
   * Logout user
   */
  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    // Log audit
    await AuditLogRepository.log({
      userId: req.user.id,
      action: 'LOGOUT',
      ipAddress: req.ip,
    });

    logger.info(`User ${req.user.email} logged out`);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  });
}
