import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { MatchingService } from './matching.service';

@Controller('api/v1/hospitals')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('match')
  async matchHospitals(@Query('caseId') caseId: string, @Query('radius') radius?: string) {
    if (!caseId) {
      throw new BadRequestException('caseId query parameter is required');
    }
    const radiusMeters = radius ? parseInt(radius, 10) : 20000;
    return this.matchingService.matchHospitals(caseId, radiusMeters);
  }
}
