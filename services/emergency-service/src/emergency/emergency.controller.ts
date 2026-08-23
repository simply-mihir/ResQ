import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmergencyService } from './emergency.service';

function generateCaseNumber() {
  return `HC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
}

@Controller('emergency')
export class EmergencyController {
  constructor(
    private prisma: PrismaService,
    private emergencyService: EmergencyService,
  ) {}

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
    @Body() body: { conscious?: boolean; breathing?: boolean; bleeding?: boolean; situationType?: string; trapped?: boolean }
  ) {
    const severityTier = this.emergencyService.computeSeverityTier(body.situationType || 'unknown', {
      unconscious: body.conscious === false,
      severeBleeding: body.bleeding === true,
      breathingProblem: body.breathing === false,
      trapped: body.trapped === true,
    });

    let severityScore = 0;
    if (severityTier === 'CRITICAL') severityScore = 10;
    else if (severityTier === 'HIGH') severityScore = 8;
    else if (severityTier === 'MEDIUM') severityScore = 5;
    else severityScore = 2;

    const updatedCase = await this.prisma.emergencyCase.update({
      where: { id },
      data: {
        triageData: JSON.parse(JSON.stringify(body)),
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

  @Post('scan/:token')
  async scanQr(
    @Param('token') token: string,
    @Body() body: { location: { lat: number; lng: number } }
  ) {
    // 1. Find profile by token
    const profile = await this.prisma.emergencyProfile.findFirst({
      where: { qrToken: token },
      include: { user: true }
    });

    if (!profile) {
      throw new Error('Invalid QR Token');
    }

    // 2. Log the scan matching the schema
    const log = await this.prisma.qrScanLog.create({
      data: {
        patientId: profile.userId,
        resolvedFields: ['bloodGroup', 'allergies', 'medications', 'chronicConditions', 'emergencyContact']
      }
    });

    // 3. Return full profile data for first responder view
    return {
      success: true,
      logId: log.id,
      profile: {
        bloodGroup: profile.bloodGroup,
        allergies: profile.allergies,
        chronicConditions: profile.chronicConditions,
        currentMedications: profile.currentMedications,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone,
        insuranceProvider: profile.insuranceProvider,
      },
      user: profile.user ? { id: profile.user.id, name: profile.user.name } : null
    };
  }

  @Get('profile/:token')
  async getProfileByToken(@Param('token') token: string) {
    const profile = await this.prisma.emergencyProfile.findFirst({
      where: { qrToken: token },
      include: { user: true }
    });

    if (!profile) {
      throw new Error('Invalid QR Token');
    }

    return {
      profile: {
        bloodGroup: profile.bloodGroup,
        allergies: profile.allergies,
        chronicConditions: profile.chronicConditions,
        currentMedications: profile.currentMedications,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone,
        insuranceProvider: profile.insuranceProvider,
      },
      user: profile.user ? { id: profile.user.id, name: profile.user.name } : null
    };
  }
}
