/**
 * Authentication Service - Business logic for user authentication
 */

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env';
import { UserRepository } from '../repositories/UserRepository';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import {
  AuthenticationError,
  ValidationError,
  ConflictError,
  NotFoundError,
} from '../utils/errors';
import { isValidEmail, isValidPassword, validatePasswordStrength } from '../utils/validators';
import logger from '../utils/logger';

export class AuthService {
  /**
   * Register new user
   */
  async register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    try {
      // Validate email
      if (!isValidEmail(data.email)) {
        throw new ValidationError('Invalid email format');
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(data.password);
      if (!passwordValidation.valid) {
        throw new ValidationError(`Password is too weak: ${passwordValidation.errors.join(', ')}`);
      }

      // Check if user already exists
      const existingUser = await UserRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcryptjs.hash(data.password, envConfig.security.bcryptRounds);

      // Create user
      const user = await UserRepository.create({
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user.id, user.email, user.role);

      // Log audit
      await AuditLogRepository.log({
        userId: user.id,
        action: 'REGISTER',
        resourceType: 'User',
        resourceId: user.id,
        details: { email: user.email },
      });

      logger.info(`User registered: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof ConflictError ||
        error instanceof AuthenticationError
      ) {
        throw error;
      }
      logger.error('Error during registration:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: { email: string; password: string }): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Find user
      const user = await UserRepository.findByEmail(data.email);
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError('User account is deactivated');
      }

      // Compare passwords
      const passwordMatch = await bcryptjs.compare(data.password, user.passwordHash);
      if (!passwordMatch) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user.id, user.email, user.role);

      // Log audit
      await AuditLogRepository.log({
        userId: user.id,
        action: 'LOGIN',
        resourceType: 'User',
        resourceId: user.id,
      });

      logger.info(`User logged in: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      logger.error('Error during login:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, envConfig.jwt.refreshSecret) as any;

      // Get user
      const user = await UserRepository.findById(decoded.id);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user.id, user.email, user.role);

      logger.info(`Token refreshed for user: ${user.email}`);

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      logger.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(
    userId: number,
    email: string,
    role: 'admin' | 'user',
  ): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      { id: userId, email, role },
      envConfig.jwt.secret,
      { expiresIn: envConfig.jwt.expiration },
    );

    const refreshToken = jwt.sign(
      { id: userId, email, role },
      envConfig.jwt.refreshSecret,
      { expiresIn: envConfig.jwt.refreshExpiration },
    );

    return { accessToken, refreshToken };
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: number): Promise<any> {
    try {
      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error(`Error getting current user ${userId}:`, error);
      throw error;
    }
  }
}

export default new AuthService();
