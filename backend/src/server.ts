/**
 * Server Entry Point
 */

import 'dotenv/config';
import { createApp } from './app';
import { validateEnv } from './config/env';
import { initializeDatabase, closeDatabase } from './config/database';
import { validateOpenAIConfig } from './config/openai';
import { envConfig } from './config/env';
import logger from './utils/logger';

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
  try {
    // Validate environment
    logger.info('Validating environment variables...');
    validateEnv();

    // Validate OpenAI config
    logger.info('Validating OpenAI configuration...');
    validateOpenAIConfig();

    // Initialize database
    logger.info('Initializing database...');
    await initializeDatabase();

    // Create Express app
    logger.info('Creating Express application...');
    const app = createApp();

    // Start server
    const server = app.listen(envConfig.port, () => {
      logger.info(`\n${'='.repeat(50)}`);
      logger.info(`🚀 Server running on port ${envConfig.port}`);
      logger.info(`Environment: ${envConfig.nodeEnv}`);
      logger.info(`API Base URL: http://localhost:${envConfig.port}/api`);
      logger.info(`${'='.repeat(50)}\n`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        try {
          // Close database connection
          await closeDatabase();
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown - graceful shutdown took too long');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this is the main module
if (require.main === module) {
  startServer();
}

export { startServer };
