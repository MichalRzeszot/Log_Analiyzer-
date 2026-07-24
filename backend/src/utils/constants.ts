/**
 * Application constants
 */

// File upload
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'txt,log,json').split(','),
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
};

// JWT
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your_secret_key',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key',
  EXPIRATION: process.env.JWT_EXPIRATION || '15m',
  REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
};

// Database
export const DB_CONFIG = {
  HOST: process.env.DB_HOST || 'localhost',
  PORT: parseInt(process.env.DB_PORT || '5432'),
  USER: process.env.DB_USER || 'postgres',
  PASSWORD: process.env.DB_PASSWORD || 'postgres',
  NAME: process.env.DB_NAME || 'log_analyzer',
};

// OpenAI
export const OPENAI_CONFIG = {
  API_KEY: process.env.OPENAI_API_KEY,
  MODEL: process.env.OPENAI_MODEL || 'gpt-4',
};

// Server
export const SERVER_CONFIG = {
  PORT: parseInt(process.env.PORT || '3000'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Security
export const SECURITY_CONFIG = {
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '10'),
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '15'), // minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
};

// Logging
export const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  DIR: process.env.LOG_DIR || './logs',
};

// API response messages
export const MESSAGES = {
  // Success
  SUCCESS: 'Operation successful',
  USER_CREATED: 'User created successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  LOG_UPLOADED: 'Log uploaded successfully',
  ANALYSIS_STARTED: 'Analysis started',
  ANALYSIS_COMPLETED: 'Analysis completed',

  // Errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User with this email already exists',
  USER_NOT_FOUND: 'User not found',
  LOG_NOT_FOUND: 'Log not found',
  ANALYSIS_NOT_FOUND: 'Analysis not found',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File is too large',
  UNAUTHORIZED: 'Unauthorized access',
  INTERNAL_ERROR: 'Internal server error',
};

// Analysis confidence levels
export const CONFIDENCE_LEVELS = {
  VERY_LOW: 0.2,
  LOW: 0.4,
  MEDIUM: 0.6,
  HIGH: 0.8,
  VERY_HIGH: 1.0,
};

// Analysis status
export const ANALYSIS_STATUS = {
  PENDING: 'pending',
  ANALYZING: 'analyzing',
  COMPLETED: 'completed',
  ERROR: 'error',
};

// Remediation status
export const REMEDIATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  EXECUTING: 'executing',
  EXECUTED: 'executed',
  FAILED: 'failed',
};

// Log status
export const LOG_STATUS = {
  UPLOADED: 'uploaded',
  ANALYZING: 'analyzing',
  ANALYZED: 'analyzed',
  ERROR: 'error',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
