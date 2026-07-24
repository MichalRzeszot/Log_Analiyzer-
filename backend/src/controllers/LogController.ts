/**
 * Log Controller - Handles log endpoints
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { LogRepository } from '../repositories/LogRepository';
import { LogAnalysisService } from '../services/LogAnalysisService';
import { FileService } from '../services/FileService';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError } from '../utils/errors';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import logger from '../utils/logger';

export class LogController {
  /**
   * POST /logs/upload
   * Upload log file
   */
  static uploadLog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { fileName, fileType, content } = req.body;

    // Validate file
    FileService.validateFile(fileName, Buffer.byteLength(content, 'utf8'), content);

    // Save file
    const savedFilename = await FileService.saveFile(fileName, content);

    // Create log record
    const log = await LogRepository.create({
      userId: req.user.id,
      fileName,
      fileType,
      content,
      filePath: savedFilename,
      fileSize: Buffer.byteLength(content, 'utf8'),
    });

    // Log audit
    await AuditLogRepository.log({
      userId: req.user.id,
      action: 'UPLOAD_LOG',
      resourceType: 'Log',
      resourceId: log.id,
      details: { fileName, fileType },
    });

    res.status(201).json({
      success: true,
      message: 'Log uploaded successfully',
      data: {
        id: log.id,
        fileName: log.fileName,
        fileType: log.fileType,
        fileSize: log.fileSize,
        status: log.status,
        createdAt: log.createdAt,
      },
    });
  });

  /**
   * GET /logs
   * Get user's logs with pagination
   */
  static getLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const [logs, total] = await LogRepository.getByUserId(req.user.id, page, limit);

    res.status(200).json({
      success: true,
      data: logs.map((log) => ({
        id: log.id,
        fileName: log.fileName,
        fileType: log.fileType,
        fileSize: log.fileSize,
        status: log.status,
        analyzed: !!log.analysis,
        createdAt: log.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * GET /logs/:id
   * Get log details
   */
  static getLogById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { id } = req.params;
    const log = await LogRepository.findById(parseInt(id, 10));

    if (!log) {
      throw new NotFoundError('Log');
    }

    if (log.userId !== req.user.id) {
      throw new NotFoundError('Log');
    }

    res.status(200).json({
      success: true,
      data: {
        id: log.id,
        fileName: log.fileName,
        fileType: log.fileType,
        fileSize: log.fileSize,
        status: log.status,
        content: log.content,
        createdAt: log.createdAt,
      },
    });
  });

  /**
   * POST /logs/:id/analyze
   * Analyze log
   */
  static analyzeLog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { id } = req.params;
    const analysis = await LogAnalysisService.analyzeLog(parseInt(id, 10), req.user.id);

    res.status(200).json({
      success: true,
      message: 'Log analysis completed',
      data: analysis,
    });
  });

  /**
   * DELETE /logs/:id
   * Delete log
   */
  static deleteLog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const { id } = req.params;
    const log = await LogRepository.findById(parseInt(id, 10));

    if (!log) {
      throw new NotFoundError('Log');
    }

    if (log.userId !== req.user.id) {
      throw new NotFoundError('Log');
    }

    // Delete file if exists
    if (log.filePath) {
      try {
        await FileService.deleteFile(log.filePath);
      } catch (error) {
        logger.warn(`Failed to delete file ${log.filePath}:`, error);
      }
    }

    // Delete log record
    await LogRepository.delete(parseInt(id, 10));

    // Log audit
    await AuditLogRepository.log({
      userId: req.user.id,
      action: 'DELETE_LOG',
      resourceType: 'Log',
      resourceId: parseInt(id, 10),
    });

    res.status(200).json({
      success: true,
      message: 'Log deleted successfully',
    });
  });
}
