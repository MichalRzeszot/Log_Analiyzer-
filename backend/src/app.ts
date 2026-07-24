/**
 * Express Application Setup
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { envConfig } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './utils/logger';

// Routes
import indexRoutes from './routes/index';
import authRoutes from './routes/auth';
import logsRoutes from './routes/logs';
import analysesRoutes from './routes/analyses';
import remediationsRoutes from './routes/remediations';
import reportsRoutes from './routes/reports';

/**
 * Create and configure Express app
 */
export const createApp = (): Express => {
  const app = express();

  // Trust proxy
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: envConfig.corsOrigin,
      credentials: true,
      optionsSuccessStatus: 200,
    }),
  );

  // Body parser
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Logging
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: envConfig.security.rateLimitWindow * 60 * 1000,
    max: envConfig.security.rateLimitMaxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  // Routes
  app.use('/api', indexRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/logs', logsRoutes);
  app.use('/api/analyses', analysesRoutes);
  app.use('/api/remediations', remediationsRoutes);
  app.use('/api/reports', reportsRoutes);

  // 404 handler
  app.use('*', notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;
