import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function generateCaseNumber() {
  return `HC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
}

@Controller('emergency')
export class EmergencyController {
  constructor(private prisma: PrismaService) {}

  @Post('trigger')
  async triggerEmergency(
    @Body() body: { locationLat: number; locationLng: number }
  ) {
    const emergencyCase = await this.prisma.emergencyCase.create({
      data: {
        caseNumber: generateCaseNumber(),
        locationLat: body.locationLat,
        locationLng: body.locationLng,
        status: 'TRIGGERED',
      },
    });

    return { caseId: emergencyCase.id, status: emergencyCase.status };
  }

  @Patch('triage/:id')
  async submitTriage(
    @Param('id') id: string,
    @Body() body: { conscious: boolean; breathing: boolean; bleeding: boolean }
  ) {
    // Basic severity calculation
    let severityTier: 'STABLE' | 'SERIOUS' | 'CRITICAL' = 'STABLE';
    let severityScore = 0;

    if (!body.conscious || !body.breathing || body.bleeding) {
      severityTier = 'CRITICAL';
      severityScore = 10;
    } else {
      severityTier = 'SERIOUS';
      severityScore = 5;
    }

    const updatedCase = await this.prisma.emergencyCase.update({
      where: { id },
      data: {
        triageData: JSON.parse(JSON.stringify(body)), // Simple conversion to json compatible
        severityTier,
        severityScore,
        status: 'TRIAGE_COMPLETE',
      },
    });

    return { caseId: updatedCase.id, status: updatedCase.status, severityTier };
  }

  @Get('active')
  async getActiveEmergencies() {
    const cases = await this.prisma.emergencyCase.findMany({
      where: {
        status: {
          in: ['TRIAGE_COMPLETE', 'DISPATCHED'],
        },
      },
      orderBy: [
        { severityScore: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return cases;
  }
}
