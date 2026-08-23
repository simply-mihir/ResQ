import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Haversine distance in kilometers between two lat/lng points.
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async dispatchAmbulance(caseId: string): Promise<{ ambulanceId: string, vehicleNumber: string, etaMinutes: number, status: string }> {
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
    });

    if (!emergencyCase) {
      throw new NotFoundException(`Case with ID ${caseId} not found`);
    }

    if (emergencyCase.status === 'DISPATCHED' || emergencyCase.assignedAmbulanceId) {
      throw new BadRequestException(`Case ${caseId} is already dispatched`);
    }

    const { locationLat, locationLng } = emergencyCase;

    // Find nearest AVAILABLE ambulance using Prisma + Haversine (no PostGIS geom column dependency)
    const availableAmbulances = await this.prisma.ambulance.findMany({
      where: { status: 'AVAILABLE' },
    });

    if (!availableAmbulances || availableAmbulances.length === 0) {
      throw new NotFoundException('No available ambulances found');
    }

    // Sort by distance using Haversine
    const withDistance = availableAmbulances
      .filter((a) => a.currentLat !== null && a.currentLng !== null)
      .map((a) => ({
        ...a,
        distanceKm: haversineKm(locationLat, locationLng, a.currentLat!, a.currentLng!),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (withDistance.length === 0) {
      throw new NotFoundException('No ambulances with known location found');
    }

    const assignedAmbulance = withDistance[0];
    const etaMinutes = Math.max(1, Math.ceil(assignedAmbulance.distanceKm / 0.66));

    // Update case and ambulance status transactionally
    await this.prisma.$transaction(async (tx) => {
      await tx.emergencyCase.update({
        where: { id: caseId },
        data: {
          assignedAmbulanceId: assignedAmbulance.id,
          status: 'DISPATCHED',
          dispatchedAt: new Date(),
          etaMinutes: etaMinutes,
        },
      });

      await tx.ambulance.update({
        where: { id: assignedAmbulance.id },
        data: {
          status: 'DISPATCHED',
        },
      });

      await tx.caseStatusHistory.create({
        data: {
          caseId: caseId,
          fromStatus: emergencyCase.status,
          toStatus: 'DISPATCHED',
          changedBy: 'system',
          notes: `Ambulance ${assignedAmbulance.vehicleNumber} dispatched. ETA: ${etaMinutes} mins.`,
        },
      });
    });

    this.logger.log(`Dispatched ambulance ${assignedAmbulance.vehicleNumber} to case ${caseId}`);

    return {
      ambulanceId: assignedAmbulance.id,
      vehicleNumber: assignedAmbulance.vehicleNumber,
      etaMinutes,
      status: 'DISPATCHED'
    };
  }
}
