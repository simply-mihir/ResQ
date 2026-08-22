import { Controller, Post, Get, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecordsService } from './records.service';

@Controller('api/v1/records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadRecord(
    @UploadedFile() file: Express.Multer.File,
    @Body('patientId') patientId: string
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!patientId) {
      throw new BadRequestException('patientId is required');
    }

    return this.recordsService.processMedicalRecord(patientId, file.buffer, file.mimetype);
  }

  @Get('review-queue')
  async getReviewQueue() {
    return this.recordsService.getRecordsForReview();
  }
}
