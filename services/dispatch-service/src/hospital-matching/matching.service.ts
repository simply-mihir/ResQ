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

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async matchHospitals(caseId: string, radiusMeters: number = 20000): Promise<{ recommendedHospitals: HospitalMatch[], fallbackUsed: boolean, queryTimeMs: number }> {
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

    // Note: in a real deployment, radiusMeters should expand if no hospitals are found in the initial radius.
    const rawMatches = await this.prisma.$queryRaw<any[]>`
      SELECT 
        id,
        name,
        specialties,
        trauma_capable,
        bed_capacity_free,
        bed_capacity_total,
        rating,
        ST_Distance(
          geom::geography,
          ST_SetSRID(ST_MakePoint(${locationLng}, ${locationLat}), 4326)::geography
        ) AS distance_meters
      FROM hospitals
      WHERE 
        ST_DWithin(
          geom::geography,
          ST_SetSRID(ST_MakePoint(${locationLng}, ${locationLat}), 4326)::geography,
          ${radiusMeters}
        )
        AND verified_partner = true
        AND bed_capacity_free > 0
      ORDER BY distance_meters ASC
      LIMIT 10;
    `;

    const hospitalIds = rawMatches.map(h => h.id);
    const specialists = await this.prisma.hospitalSpecialist.findMany({
      where: {
        hospitalId: { in: hospitalIds },
        specialty: requiredSpecialty,
      }
    });

    const specialistMap = new Map(specialists.map(s => [s.hospitalId, s.available]));

    const rankedHospitals: HospitalMatch[] = rawMatches.map((h) => {
      const distanceKm = h.distance_meters / 1000;
      const etaMin = Math.ceil(distanceKm / 0.5); // 30km/h average urban speed

      const hasRequiredSpecialty = specialistMap.get(h.id) === true;
      
      const travelTimeScore = Math.max(0, 40 - (etaMin * 1.5)); 
      
      const bedRatio = h.bed_capacity_total > 0 ? (h.bed_capacity_free / h.bed_capacity_total) : 0;
      const bedCapacityScore = Math.min(30, bedRatio * 30 + 10); 

      // If specialty is required and missing/unavailable, score 0 for specialty match.
      const specialistMatchScore = hasRequiredSpecialty ? 30 : 0;

      let traumaBonusScore = 0;
      if (severityTier === 'CRITICAL' && h.trauma_capable) {
        traumaBonusScore = 20;
      }

      const rating = h.rating || 5.0;
      const ratingScore = (rating / 5.0) * 10;

      const totalScore = travelTimeScore + bedCapacityScore + specialistMatchScore + traumaBonusScore + ratingScore;

      return {
        hospitalId: h.id,
        name: h.name,
        distanceKm: parseFloat(distanceKm.toFixed(1)),
        etaMin,
        bedCapacityFree: h.bed_capacity_free,
        specialties: h.specialties || [],
        totalScore: Math.round(Math.min(100, totalScore)),
        traumaCapable: h.trauma_capable,
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
      recommendedHospitals: rankedHospitals,
      fallbackUsed: false,
      queryTimeMs
    };
  }

  private timeouts = new Map<string, NodeJS.Timeout>();

  async alertHospital(caseId: string, hospitalId: string, alternates: HospitalMatch[]) {
    // 1. Clear any existing timeout
    if (this.timeouts.has(caseId)) {
      clearTimeout(this.timeouts.get(caseId)!);
      this.timeouts.delete(caseId);
    }

    // 2. Update DB that hospital is alerted
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
        fromStatus: 'TRIAGE_COMPLETE', // simplified
        toStatus: 'TRIAGE_COMPLETE',
        changedBy: 'system',
        notes: `Hospital ${hospitalId} alerted. Waiting for acceptance.`,
      }
    });

    this.logger.log(`Alerted hospital ${hospitalId} for case ${caseId}`);

    // 3. Set timeout (e.g. 45 seconds for demo pacing)
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
