import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Look up the emergency profile by QR token
    const profile = await prisma.emergencyProfile.findUnique({
      where: { qrToken: token },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found for this QR token' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        bloodGroup: profile.bloodGroup,
        allergies: profile.allergies,
        chronicConditions: profile.chronicConditions,
        currentMedications: profile.currentMedications,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone,
        insuranceProvider: profile.insuranceProvider,
        insurancePolicyNumber: profile.insurancePolicyNumber,
      },
      user: profile.user
        ? { name: profile.user.name, email: profile.user.email, phone: profile.user.phone }
        : null,
    });
  } catch (error) {
    console.error('[qr/profile] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
