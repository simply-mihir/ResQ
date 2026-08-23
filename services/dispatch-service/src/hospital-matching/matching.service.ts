import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ScoreBreakdown {
  travelTime: number;
  bedCapacity: number;
  specialistMatch: number;
  traumaBonus: number;
  rating: number;
}

export interface HospitalMatch {
  hospitalId: string;
  name: string;
  distanceKm: number;
  etaMin: number;
  bedCapacityFree: number;
  specialties: string[];
  totalScore: number;
  breakdown: ScoreBreakdown;
  traumaCapable: boolean;
  rating: number;
  specialistAvailable: boolean;
}

/**
 * Haversine distance in kilometers between two lat/lng points.
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
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
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async matchHospitals(caseId: string, radiusKm: number = 20): Promise<{ recommendedHospitals: HospitalMatch[], fallbackUsed: boolean, queryTimeMs: number }> {
    const startTime = Date.now();

    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
    });

    if (!emergencyCase) {
      throw new NotFoundException(`Case with ID ${caseId} not found`);
    }

    const { locationLat, locationLng, severityTier, triageData } = emergencyCase;

    let requiredSpecialty = 'general';
    if (triageData && typeof triageData === 'object' && 'situationType' in triageData) {
      const situationType = (triageData as any).situationType;
      if (situationType === 'cardiac') requiredSpecialty = 'cardiology';
      else if (situationType === 'accident') requiredSpecialty = 'trauma_surgery';
      else if (situationType === 'stroke') requiredSpecialty = 'neurology';
    }

    // Fetch all verified hospitals with free beds using Prisma (no PostGIS dependency)
    const hospitals = await this.prisma.hospital.findMany({
      where: {
        verifiedPartner: true,
        bedCapacityFree: { gt: 0 },
      },
      include: {
        specialists: {
          where: { specialty: requiredSpecialty },
        },
      },
    });

    // Filter by radius and compute distance using Haversine formula
    let fallbackUsed = false;
    let filtered = hospitals
      .map((h) => ({
        ...h,
        distanceKm: haversineKm(locationLat, locationLng, h.locationLat, h.locationLng),
      }))
      .filter((h) => h.distanceKm <= radiusKm);

    // If no hospitals found within radius, expand to all (fallback)
    // Note: in a real deployment, this should be an expanding-radius search
    if (filtered.length === 0) {
      this.logger.warn(`No hospitals within ${radiusKm}km, falling back to all verified hospitals`);
      fallbackUsed = true;
      filtered = hospitals.map((h) => ({
        ...h,
        distanceKm: haversineKm(locationLat, locationLng, h.locationLat, h.locationLng),
      }));
    }

    const rankedHospitals: HospitalMatch[] = filtered.map((h) => {
      const etaMin = Math.ceil(h.distanceKm / 0.5); // 30km/h average urban speed

      const hasRequiredSpecialty = h.specialists.some((s) => s.available);

      const travelTimeScore = Math.max(0, 40 - (etaMin * 1.5));

      const bedRatio = h.bedCapacityTotal > 0 ? (h.bedCapacityFree / h.bedCapacityTotal) : 0;
      const bedCapacityScore = Math.min(30, bedRatio * 30 + 10);

      const specialistMatchScore = hasRequiredSpecialty ? 30 : 0;

      let traumaBonusScore = 0;
      if (severityTier === 'CRITICAL' && h.traumaCapable) {
        traumaBonusScore = 20;
      }

      const rating = h.rating || 5.0;
      const ratingScore = (rating / 5.0) * 10;

      const totalScore = travelTimeScore + bedCapacityScore + specialistMatchScore + traumaBonusScore + ratingScore;

      return {
        hospitalId: h.id,
        name: h.name,
        distanceKm: parseFloat(h.distanceKm.toFixed(1)),
        etaMin,
        bedCapacityFree: h.bedCapacityFree,
        specialties: h.specialties || [],
        totalScore: Math.round(Math.min(100, totalScore)),
        traumaCapable: h.traumaCapable,
        rating: h.rating,
        specialistAvailable: hasRequiredSpecialty,
        breakdown: {
          travelTime: Math.round(travelTimeScore),
          bedCapacity: Math.round(bedCapacityScore),
          specialistMatch: Math.round(specialistMatchScore),
          traumaBonus: Math.round(traumaBonusScore),
          rating: Math.round(ratingScore),
        }
      };
    });

    rankedHospitals.sort((a, b) => b.totalScore - a.totalScore);

    const queryTimeMs = Date.now() - startTime;

    return {
      recommendedHospitals: rankedHospitals.slice(0, 10),
      fallbackUsed,
      queryTimeMs
    };
  }

  private timeouts = new Map<string, NodeJS.Timeout>();

  async alertHospital(caseId: string, hospitalId: string, alternates: HospitalMatch[]) {
    if (this.timeouts.has(caseId)) {
      clearTimeout(this.timeouts.get(caseId)!);
      this.timeouts.delete(caseId);
    }

    await this.prisma.emergencyCase.update({
      where: { id: caseId },
      data: {
        assignedHospitalId: hospitalId,
        hospitalAlertedAt: new Date(),
      }
    });

    await this.prisma.caseStatusHistory.create({
      data: {
        caseId,
        fromStatus: 'TRIAGE_COMPLETE',
        toStatus: 'TRIAGE_COMPLETE',
        changedBy: 'system',
        notes: `Hospital ${hospitalId} alerted. Waiting for acceptance.`,
      }
    });

    this.logger.log(`Alerted hospital ${hospitalId} for case ${caseId}`);

    // Auto-reassign after 45 seconds if hospital doesn't respond (demo pacing)
    const timeout = setTimeout(async () => {
      this.logger.warn(`Hospital ${hospitalId} timed out for case ${caseId}. Reassigning...`);

      await this.prisma.caseStatusHistory.create({
        data: {
          caseId,
          fromStatus: 'TRIAGE_COMPLETE',
          toStatus: 'TRIAGE_COMPLETE',
          changedBy: 'system',
          notes: `HOSPITAL_REASSIGNED: Hospital ${hospitalId} failed to respond in time.`,
        }
      });

      if (alternates && alternates.length > 0) {
        const next = alternates[0];
        const remaining = alternates.slice(1);
        await this.alertHospital(caseId, next.hospitalId, remaining);
      } else {
        this.logger.error(`No more alternates for case ${caseId}!`);
      }
    }, 45000);

    this.timeouts.set(caseId, timeout);

    return { success: true, message: 'Hospital alerted and timeout started.' };
  }

  async acceptCase(caseId: string, hospitalId: string) {
    if (this.timeouts.has(caseId)) {
      clearTimeout(this.timeouts.get(caseId)!);
      this.timeouts.delete(caseId);
    }

    await this.prisma.emergencyCase.update({
      where: { id: caseId },
      data: {
        assignedHospitalId: hospitalId,
        hospitalAcknowledgedAt: new Date(),
      }
    });

    await this.prisma.caseStatusHistory.create({
      data: {
        caseId,
        fromStatus: 'TRIAGE_COMPLETE',
        toStatus: 'TRIAGE_COMPLETE',
        changedBy: hospitalId,
        notes: `Hospital ${hospitalId} accepted the case.`,
      }
    });

    this.logger.log(`Hospital ${hospitalId} accepted case ${caseId}`);
    return { success: true };
  }
}
