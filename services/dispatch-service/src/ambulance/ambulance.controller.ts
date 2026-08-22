import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { DispatchService } from './dispatch.service';

@Controller('api/v1/dispatch')
export class AmbulanceController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post('ambulance')
  async dispatchAmbulance(@Body('caseId') caseId: string) {
    if (!caseId) {
      throw new BadRequestException('caseId is required in request body');
    }
    return this.dispatchService.dispatchAmbulance(caseId);
  }
}
