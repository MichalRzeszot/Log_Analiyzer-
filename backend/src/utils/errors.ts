/**
 * Custom application errors
 * Centralized error handling for the application
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error - 400
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error - 401
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error - 403
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true);
    this.name = 'AuthorizationError';
  }
}

/**
 * Resource not found error - 404
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error - 409
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true);
    this.name = 'ConflictError';
  }
}

/**
 * Rate limit error - 429
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 429, true);
    this.name = 'RateLimitError';
  }
}

/**
 * Internal server error - 500
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, true);
    this.name = 'InternalServerError';
  }
}

/**
 * Service unavailable error - 503
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, true);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, true);
    this.name = 'DatabaseError';
  }
}

/**
 * External API error
 */
export class ExternalAPIError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} API error: ${message}`, 503, true);
    this.name = 'ExternalAPIError';
  }
}

/**
 * File operation error
 */
export class FileOperationError extends AppError {
  constructor(message: string = 'File operation failed') {
    super(message, 400, true);
    this.name = 'FileOperationError';
  }
}
