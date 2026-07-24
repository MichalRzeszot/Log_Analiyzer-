/**
 * File Service - Business logic for file operations
 */

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { envConfig } from '../config/env';
import { FileOperationError, ValidationError } from '../utils/errors';
import { isValidFileType, isValidFileSize } from '../utils/validators';
import logger from '../utils/logger';

export class FileService {
  private uploadDir = envConfig.upload.dir;
  private maxFileSize = envConfig.upload.maxFileSize;
  private allowedFileTypes = envConfig.upload.allowedFileTypes;

  constructor() {
    this.ensureUploadDirExists();
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDirExists(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      logger.error('Error creating upload directory:', error);
    }
  }

  /**
   * Validate file
   */
  validateFile(filename: string, fileSize: number, content?: string): void {
    // Check file type
    if (!isValidFileType(filename, this.allowedFileTypes)) {
      throw new ValidationError(
        `Invalid file type. Allowed types: ${this.allowedFileTypes.join(', ')}`,
      );
    }

    // Check file size
    if (!isValidFileSize(fileSize, this.maxFileSize)) {
      throw new ValidationError(
        `File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Validate content if provided
    if (content && content.length === 0) {
      throw new ValidationError('File content is empty');
    }
  }

  /**
   * Save file to disk
   */
  async saveFile(filename: string, content: string): Promise<string> {
    try {
      // Validate
      this.validateFile(filename, Buffer.byteLength(content, 'utf8'), content);

      // Generate unique filename
      const ext = path.extname(filename);
      const uniqueFilename = `${uuidv4()}${ext}`;
      const filePath = path.join(this.uploadDir, uniqueFilename);

      // Write file
      await fs.writeFile(filePath, content, 'utf8');
      logger.info(`File saved: ${uniqueFilename}`);

      return uniqueFilename;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      logger.error('Error saving file:', error);
      throw new FileOperationError('Failed to save file');
    }
  }

  /**
   * Read file from disk
   */
  async readFile(filename: string): Promise<string> {
    try {
      const filePath = path.join(this.uploadDir, filename);
      // Security: prevent directory traversal
      const normalizedPath = path.normalize(filePath);
      if (!normalizedPath.startsWith(this.uploadDir)) {
        throw new FileOperationError('Invalid file path');
      }
      return await fs.readFile(normalizedPath, 'utf8');
    } catch (error) {
      if (error instanceof FileOperationError) {
        throw error;
      }
      logger.error(`Error reading file ${filename}:`, error);
      throw new FileOperationError('Failed to read file');
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, filename);
      // Security: prevent directory traversal
      const normalizedPath = path.normalize(filePath);
      if (!normalizedPath.startsWith(this.uploadDir)) {
        throw new FileOperationError('Invalid file path');
      }
      await fs.unlink(normalizedPath);
      logger.info(`File deleted: ${filename}`);
    } catch (error) {
      if (error instanceof FileOperationError) {
        throw error;
      }
      logger.error(`Error deleting file ${filename}:`, error);
      throw new FileOperationError('Failed to delete file');
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(filename: string): Promise<{ size: number; created: Date }> {
    try {
      const filePath = path.join(this.uploadDir, filename);
      // Security: prevent directory traversal
      const normalizedPath = path.normalize(filePath);
      if (!normalizedPath.startsWith(this.uploadDir)) {
        throw new FileOperationError('Invalid file path');
      }
      const stats = await fs.stat(normalizedPath);
      return {
        size: stats.size,
        created: stats.birthtime,
      };
    } catch (error) {
      logger.error(`Error getting file info for ${filename}:`, error);
      throw new FileOperationError('Failed to get file info');
    }
  }
}

export default new FileService();
