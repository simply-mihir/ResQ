import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ScoreBreakdown {
  travel: number;
  beds: number;
  specialty: number;
  severity_bonus: number;
  rating_bonus: number;
  explanation: string;
}

export interface HospitalMatch {
  hospital_id: string;
  name: string;
  distance_km: number;
  travel_time_minutes: number;
  bed_capacity_free: number;
  specialties: string[];
  match_score: number;
  score_breakdown: ScoreBreakdown;
  trauma_capable: boolean;
  rating: number;
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async matchHospitals(caseId: string, radiusMeters: number = 20000): Promise<{ recommendedHospitals: HospitalMatch[], fallbackUsed: boolean, queryTimeMs: number }> {
    const startTime = Date.now();
    
    // 1. Fetch the case details
    const emergencyCase = await this.prisma.emergencyCase.findUnique({
      where: { id: caseId },
    });

    if (!emergencyCase) {
      throw new NotFoundException(`Case with ID ${caseId} not found`);
    }

    const { locationLat, locationLng, severityTier } = emergencyCase;

    // 2. Perform PostGIS raw SQL query to find hospitals within radius
    // We use ST_DWithin for efficient radius search, and ST_Distance to get actual distance.
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

    // 3. Score and format the results
    const rankedHospitals: HospitalMatch[] = rawMatches.map((h) => {
      const distanceKm = h.distance_meters / 1000;
      // Estimate travel time (assuming 30km/h average urban speed) -> 30km/60min = 0.5km/min
      const travelTimeMinutes = Math.ceil(distanceKm / 0.5);

      // Scoring Logic (Total 100)
      // Travel time (40 pts max): closer is better
      const travelScore = Math.max(0, 40 - (travelTimeMinutes * 1.5)); 
      
      // Bed availability (30 pts max): more free beds is better
      const bedRatio = h.bed_capacity_total > 0 ? (h.bed_capacity_free / h.bed_capacity_total) : 0;
      const bedsScore = Math.min(30, bedRatio * 30 + 10); 

      // Specialty (30 pts max)
      // Trauma capability bonus for CRITICAL cases
      let severityBonus = 0;
      let specialtyScore = 15; // base score for a verified hospital
      if (severityTier === 'CRITICAL' && h.trauma_capable) {
        severityBonus = 30; // Max out severity bonus
      }

      // Rating bonus (up to 10 pts)
      const rating = h.rating || 5.0;
      const ratingBonus = (rating / 5.0) * 10;

      const totalScore = travelScore + bedsScore + specialtyScore + severityBonus + ratingBonus;
      const finalScore = Math.min(100, totalScore);

      return {
        hospital_id: h.id,
        name: h.name,
        distance_km: parseFloat(distanceKm.toFixed(1)),
        travel_time_minutes: travelTimeMinutes,
        bed_capacity_free: h.bed_capacity_free,
        specialties: h.specialties || [],
        match_score: finalScore,
        trauma_capable: h.trauma_capable,
        rating: h.rating,
        score_breakdown: {
          travel: Math.round(travelScore),
          beds: Math.round(bedsScore),
          specialty: specialtyScore,
          severity_bonus: severityBonus,
          rating_bonus: Math.round(ratingBonus),
          explanation: `Matched based on ${distanceKm.toFixed(1)}km distance (${travelTimeMinutes} min), ${h.bed_capacity_free} available beds, and ${h.rating} star rating.`
        }
      };
    });

    // Sort by match_score descending
    rankedHospitals.sort((a, b) => b.match_score - a.match_score);

    const queryTimeMs = Date.now() - startTime;

    return {
      recommendedHospitals: rankedHospitals,
      fallbackUsed: false,
      queryTimeMs
    };
  }
}
