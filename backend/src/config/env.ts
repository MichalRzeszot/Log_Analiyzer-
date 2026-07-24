/**
 * Environment variables validation and configuration
 */

import { ValidationError } from '../utils/errors';

/**
 * Required environment variables
 */
const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'OPENAI_API_KEY',
];

/**
 * Validate environment variables
 */
export const validateEnv = (): void => {
  const missingVars: string[] = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  });

  if (missingVars.length > 0) {
    throw new ValidationError(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
        `Please copy .env.example to .env and fill in the required values.`,
    );
  }
};

/**
 * Get environment variable with default value
 */
export const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new ValidationError(`Environment variable ${key} is not set`);
  }
  return value;
};

/**
 * Get numeric environment variable
 */
export const getEnvVarAsNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new ValidationError(`Environment variable ${key} is not set`);
  }
  const numValue = parseInt(value, 10);
  if (isNaN(numValue)) {
    throw new ValidationError(`Environment variable ${key} must be a number`);
  }
  return numValue;
};

/**
 * Get boolean environment variable
 */
export const getEnvVarAsBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = process.env[key];
  if (!value) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
};

/**
 * Environment configuration object
 */
export const envConfig = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: getEnvVarAsNumber('PORT', 3000),
  corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),

  // Database
  database: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: getEnvVarAsNumber('DB_PORT', 5432),
    user: getEnvVar('DB_USER', 'postgres'),
    password: getEnvVar('DB_PASSWORD', 'postgres'),
    name: getEnvVar('DB_NAME', 'log_analyzer'),
  },

  // JWT
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    refreshSecret: getEnvVar('JWT_REFRESH_SECRET'),
    expiration: getEnvVar('JWT_EXPIRATION', '15m'),
    refreshExpiration: getEnvVar('JWT_REFRESH_EXPIRATION', '7d'),
  },

  // OpenAI
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY'),
    model: getEnvVar('OPENAI_MODEL', 'gpt-4'),
  },

  // File upload
  upload: {
    dir: getEnvVar('UPLOAD_DIR', './uploads'),
    maxFileSize: getEnvVarAsNumber('MAX_FILE_SIZE', 10485760),
    allowedFileTypes: (getEnvVar('ALLOWED_FILE_TYPES', 'txt,log,json')).split(','),
  },

  // Security
  security: {
    bcryptRounds: getEnvVarAsNumber('BCRYPT_ROUNDS', 10),
    rateLimitWindow: getEnvVarAsNumber('RATE_LIMIT_WINDOW', 15),
    rateLimitMaxRequests: getEnvVarAsNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },

  // Logging
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info'),
    dir: getEnvVar('LOG_DIR', './logs'),
  },
};

export default envConfig;
