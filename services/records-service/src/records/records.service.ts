import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Tesseract from 'tesseract.js';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processMedicalRecord(patientId: string, fileBuffer: Buffer, mimetype: string) {
    this.logger.log(`Starting OCR processing for patient ${patientId}`);
    
    // 1. Create a dummy record in PROCESSING state
    const record = await this.prisma.medicalRecordEntry.create({
      data: {
        patientId,
        status: 'PROCESSING',
        sourceDocumentUrl: 'uploaded-file.jpg', // Mock URL
        documentType: 'unknown',
      }
    });

    try {
      // 2. Perform OCR using Tesseract (Node.js)
      const result = await Tesseract.recognize(fileBuffer, 'eng');
      const text = result.data.text;
      
      this.logger.log(`OCR Extracted Text length: ${text.length}`);

      // 3. Simple Mock NLP parsing based on keywords
      const extractedData: any = { rawText: text };
      const lowConfidenceFields: string[] = [];

      let docType = 'general_report';
      if (text.toLowerCase().includes('prescription') || text.toLowerCase().includes('rx')) {
        docType = 'prescription';
      } else if (text.toLowerCase().includes('lab') || text.toLowerCase().includes('test')) {
        docType = 'lab_report';
      }

      if (result.data.confidence < 70) {
        lowConfidenceFields.push('entire_document');
      }

      // Update record with extracted data
      await this.prisma.medicalRecordEntry.update({
        where: { id: record.id },
        data: {
          status: 'AI_EXTRACTED',
          documentType: docType,
          extractedData: extractedData,
          extractionConfidence: result.data.confidence / 100,
          lowConfidenceFields: lowConfidenceFields,
        }
      });

      return { recordId: record.id, status: 'AI_EXTRACTED' };

    } catch (error) {
      this.logger.error('OCR Processing failed', error);
      await this.prisma.medicalRecordEntry.update({
        where: { id: record.id },
        data: { status: 'REJECTED' }
      });
      throw error;
    }
  }

  async getRecordsForReview() {
    return this.prisma.medicalRecordEntry.findMany({
      where: { status: 'AI_EXTRACTED' },
      orderBy: { createdAt: 'desc' }
    });
  }
}
