import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── Haversine distance (km) ───
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Derive needed specialty from triage / severity ───
function deriveSpecialty(triageData: any, severityTier: string | null): string | null {
  if (!triageData) return null;
  const scenario = (triageData as any)?.scenario?.toLowerCase() ?? '';
  if (scenario.includes('cardiac') || scenario.includes('heart') || scenario.includes('chest')) return 'cardiology';
  if (scenario.includes('stroke') || scenario.includes('neuro')) return 'neurology';
  if (scenario.includes('accident') || scenario.includes('trauma') || scenario.includes('fracture')) return 'trauma_surgery';
  if (scenario.includes('burn')) return 'burn_unit';
  if (scenario.includes('pediatric') || scenario.includes('child')) return 'pediatrics';
  // Default: for CRITICAL severity, favour trauma_surgery
  if (severityTier === 'CRITICAL') return 'trauma_surgery';
  return null;
}

// ─── Scoring dimensions (max theoretical = 130 for CRITICAL) ───
function scoreHospital(
  hospital: any,
  distanceKm: number,
  neededSpecialty: string | null,
  severityTier: string | null,
) {
  // 1. Travel time score (max 40): closer = better
  //    Assume 40 km/h average urban speed → ETA in minutes
  const etaMin = Math.round((distanceKm / 40) * 60);
  const travelTime = Math.max(0, Math.round(40 - distanceKm * 2)); // 0 at 20 km

  // 2. Bed capacity score (max 30)
  const bedCapacity = Math.min(30, Math.round((hospital.bedCapacityFree / Math.max(hospital.bedCapacityTotal, 1)) * 30));

  // 3. Specialist match (max 30)
  let specialistMatch = 0;
  let specialistAvailable = false;
  if (neededSpecialty) {
    const specialties: string[] = hospital.specialties ?? [];
    if (specialties.map((s: string) => s.toLowerCase()).includes(neededSpecialty.toLowerCase())) {
      specialistMatch = 30;
      specialistAvailable = true;
    }
  } else {
    // No specific specialty needed — give partial credit
    specialistMatch = 15;
    specialistAvailable = true;
  }

  // 4. Trauma center bonus (max 20, only for CRITICAL)
  const traumaBonus = severityTier === 'CRITICAL' && hospital.traumaCapable ? 20 : 0;

  // 5. Rating score (max 10)
  const rating = Math.round((hospital.rating / 5) * 10);

  const totalScore = travelTime + bedCapacity + specialistMatch + traumaBonus + rating;

  return {
    totalScore,
    etaMin,
    distanceKm: parseFloat(distanceKm.toFixed(1)),
    specialistAvailable,
    breakdown: { travelTime, bedCapacity, specialistMatch, traumaBonus, rating },
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json({ error: 'caseId required' }, { status: 400 });
    }

    // Load the case
    const emergencyCase = await prisma.emergencyCase.findUnique({ where: { id: caseId } });
    if (!emergencyCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Load all verified hospitals with free beds
    const hospitals = await prisma.hospital.findMany({
      where: {
        verifiedPartner: true,
        bedCapacityFree: { gt: 0 },
      },
    });

    const neededSpecialty = deriveSpecialty(emergencyCase.triageData, emergencyCase.severityTier);

    // Score & rank
    const scored = hospitals
      .map((h) => {
        const dist = haversineKm(emergencyCase.locationLat, emergencyCase.locationLng, h.locationLat, h.locationLng);
        // Filter out hospitals beyond 50 km
        if (dist > 50) return null;
        const scores = scoreHospital(h, dist, neededSpecialty, emergencyCase.severityTier);
        return {
          hospitalId: h.id,
          name: h.name,
          address: h.address,
          phone: h.phone,
          bedCapacityFree: h.bedCapacityFree,
          bedCapacityTotal: h.bedCapacityTotal,
          rating: h.rating,
          specialties: h.specialties,
          traumaCapable: h.traumaCapable,
          ...scores,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.totalScore - a.totalScore);

    return NextResponse.json({ recommendedHospitals: scored });
  } catch (error) {
    console.error('[hospitals/match] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
