/**
 * Report Service - Business logic for generating reports
 */

import PDFDocument from 'pdfkit';
import { createWriteStream, createReadStream } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { envConfig } from '../config/env';
import { AnalysisRepository } from '../repositories/AnalysisRepository';
import { NotFoundError, FileOperationError } from '../utils/errors';
import logger from '../utils/logger';

export class ReportService {
  private reportDir = path.join(envConfig.upload.dir, 'reports');

  /**
   * Generate PDF report from analysis
   */
  async generatePDFReport(analysisId: number, userId: number): Promise<string> {
    try {
      // Get analysis
      const analysis = await AnalysisRepository.findById(analysisId);
      if (!analysis) {
        throw new NotFoundError('Analysis');
      }

      // Check ownership
      if (analysis.userId !== userId) {
        throw new NotFoundError('Analysis');
      }

      // Create report filename
      const reportFilename = `report_${uuidv4()}.pdf`;
      const reportPath = path.join(this.reportDir, reportFilename);

      // Ensure report directory exists
      await this.ensureReportDirExists();

      // Create PDF
      const pdf = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      // Pipe to file
      const writeStream = createWriteStream(reportPath);
      pdf.pipe(writeStream);

      // Add content
      this.addPDFContent(pdf, analysis);

      // Finalize
      pdf.end();

      // Wait for finish
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      logger.info(`Report generated: ${reportFilename}`);
      return reportFilename;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error(`Error generating report for analysis ${analysisId}:`, error);
      throw new FileOperationError('Failed to generate report');
    }
  }

  /**
   * Add content to PDF
   */
  private addPDFContent(pdf: PDFDocument, analysis: any): void {
    // Header
    pdf.fontSize(24).font('Helvetica-Bold').text('Log Analysis Report', { align: 'center' });
    pdf.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    pdf.moveDown();

    // Analysis ID
    pdf.fontSize(12).font('Helvetica-Bold').text('Analysis Information');
    pdf.fontSize(10).font('Helvetica').text(`Analysis ID: ${analysis.id}`);
    pdf.text(`Log ID: ${analysis.logId}`);
    pdf.text(`Confidence Level: ${(analysis.confidenceLevel * 100).toFixed(1)}%`);
    pdf.text(`Analysis Time: ${analysis.analysisTime}ms`);
    pdf.moveDown();

    // Detected Problem
    pdf.fontSize(12).font('Helvetica-Bold').text('Detected Problem');
    pdf.fontSize(10).font('Helvetica').text(analysis.detectedProblem, { align: 'left' });
    pdf.moveDown();

    // Root Cause
    pdf.fontSize(12).font('Helvetica-Bold').text('Root Cause');
    pdf.fontSize(10).font('Helvetica').text(analysis.rootCause, { align: 'left' });
    pdf.moveDown();

    // Proposed Actions
    pdf.fontSize(12).font('Helvetica-Bold').text('Proposed Actions');
    analysis.proposedActions.forEach((action: any, index: number) => {
      pdf.fontSize(10).font('Helvetica-Bold').text(`${index + 1}. ${action.action}`);
      pdf.fontSize(9).font('Helvetica').text(`Type: ${action.type}`);
      pdf.text(`Priority: ${action.priority.toUpperCase()}`);
      if (action.parameters) {
        pdf.text(`Parameters: ${JSON.stringify(action.parameters)}`);
      }
      pdf.moveDown(0.5);
    });

    // Footer
    pdf.fontSize(9).text('--- End of Report ---', { align: 'center' });
  }

  /**
   * Ensure report directory exists
   */
  private async ensureReportDirExists(): Promise<void> {
    return new Promise((resolve, reject) => {
      const fs = require('fs');
      fs.mkdir(this.reportDir, { recursive: true }, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Get report file stream
   */
  getReportStream(filename: string): NodeJS.ReadableStream {
    try {
      const reportPath = path.join(this.reportDir, filename);
      // Security: prevent directory traversal
      const normalizedPath = path.normalize(reportPath);
      if (!normalizedPath.startsWith(this.reportDir)) {
        throw new FileOperationError('Invalid file path');
      }
      return createReadStream(normalizedPath);
    } catch (error) {
      logger.error(`Error getting report stream for ${filename}:`, error);
      throw new FileOperationError('Failed to get report');
    }
  }
}

export default new ReportService();
