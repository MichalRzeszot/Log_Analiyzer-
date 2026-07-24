/**
 * Authentication middleware - JWT token verification
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Extended Express Request with user data
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'admin' | 'user';
  };
  token?: string;
}

/**
 * JWT token payload interface
 */
interface TokenPayload {
  id: number;
  email: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

/**
 * Middleware to verify JWT token
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AuthenticationError('Access token is required');
    }

    // Verify token
    const decoded = jwt.verify(token, envConfig.jwt.secret) as TokenPayload;

    // Attach user data to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    req.token = token;

    logger.debug(`User ${decoded.email} authenticated`);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Token expired');
      throw new AuthenticationError('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token');
      throw new AuthenticationError('Invalid token');
    }
    throw error;
  }
};

/**
 * Middleware to verify admin role
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    throw new AuthenticationError('User not authenticated');
  }

  if (req.user.role !== 'admin') {
    logger.warn(`User ${req.user.email} attempted to access admin resource`);
    throw new AuthorizationError('Admin privileges required');
  }

  next();
};

/**
 * Middleware to verify user ownership of resource
 */
export const requireResourceOwnership = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    throw new AuthenticationError('User not authenticated');
  }

  // Extract userId from params or body
  const resourceUserId = req.params.userId || req.body.userId;

  if (resourceUserId && req.user.id !== parseInt(resourceUserId, 10) && req.user.role !== 'admin') {
    logger.warn(`User ${req.user.email} attempted to access resource they don't own`);
    throw new AuthorizationError('You do not have permission to access this resource');
  }

  next();
};

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if token is missing
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, envConfig.jwt.secret) as TokenPayload;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      req.token = token;
    }
  } catch (error) {
    logger.debug('Optional authentication failed, continuing without user');
  }

  next();
};
