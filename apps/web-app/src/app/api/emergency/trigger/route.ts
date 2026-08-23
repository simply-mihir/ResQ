import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { locationLat, locationLng } = await req.json();

    if (locationLat == null || locationLng == null) {
      return NextResponse.json({ error: 'Location required' }, { status: 400 });
    }

    // Get current user if logged in
    const cookieStore = await cookies();
    const userId = cookieStore.get('health-session')?.value || null;

    // Generate a human-readable case number
    const caseCount = await prisma.emergencyCase.count();
    const caseNumber = `HC-${new Date().getFullYear()}-${String(caseCount + 1).padStart(5, '0')}`;

    // Look up user's emergency profile if logged in
    let emergencyProfileId: string | null = null;
    if (userId) {
      const profile = await prisma.emergencyProfile.findUnique({
        where: { userId },
      });
      if (profile) {
        emergencyProfileId = profile.id;
      }
    }

    const emergencyCase = await prisma.emergencyCase.create({
      data: {
        caseNumber,
        status: 'TRIGGERED',
        triggeredByUserId: userId,
        patientId: userId,
        emergencyProfileId,
        locationLat: parseFloat(String(locationLat)),
        locationLng: parseFloat(String(locationLng)),
      },
    });

    return NextResponse.json({
      caseId: emergencyCase.id,
      caseNumber: emergencyCase.caseNumber,
      status: emergencyCase.status,
    });
  } catch (error) {
    console.error('[emergency/trigger] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
