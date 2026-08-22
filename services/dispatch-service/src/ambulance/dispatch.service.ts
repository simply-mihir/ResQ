import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async dispatchAmbulance(caseId: string): Promise<{ ambulanceId: string, vehicleNumber: string, etaMinutes: number, status: string }> {
    // 1. Get the case location
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

    // 2. Find nearest AVAILABLE ambulance using PostGIS
    const nearestAmbulances = await this.prisma.$queryRaw<any[]>`
      SELECT 
        id,
        vehicle_number,
        ST_Distance(
          geom::geography,
          ST_SetSRID(ST_MakePoint(${locationLng}, ${locationLat}), 4326)::geography
        ) AS distance_meters
      FROM ambulances
      WHERE 
        status = 'AVAILABLE'
      ORDER BY distance_meters ASC
      LIMIT 1;
    `;

    if (!nearestAmbulances || nearestAmbulances.length === 0) {
      throw new NotFoundException('No available ambulances found nearby');
    }

    const assignedAmbulance = nearestAmbulances[0];
    const distanceKm = assignedAmbulance.distance_meters / 1000;
    
    // Estimate ETA (assuming 40km/h for ambulance ~ 0.66 km/min)
    const etaMinutes = Math.max(1, Math.ceil(distanceKm / 0.66));

    // 3. Update case and ambulance status transactionally
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

      // Add status history
      await tx.caseStatusHistory.create({
        data: {
          caseId: caseId,
          fromStatus: emergencyCase.status,
          toStatus: 'DISPATCHED',
          changedBy: 'system',
          notes: `Ambulance ${assignedAmbulance.vehicle_number} dispatched. ETA: ${etaMinutes} mins.`,
        },
      });
    });

    this.logger.log(`Dispatched ambulance ${assignedAmbulance.vehicle_number} to case ${caseId}`);

    return {
      ambulanceId: assignedAmbulance.id,
      vehicleNumber: assignedAmbulance.vehicle_number,
      etaMinutes,
      status: 'DISPATCHED'
    };
  }
}
