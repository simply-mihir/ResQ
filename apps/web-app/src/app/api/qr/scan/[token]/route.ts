import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { token: string } }) {
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

    // Log the scan
    await prisma.qrScanLog.create({
      data: {
        patientId: profile.userId,
        resolvedFields: [
          'bloodGroup',
          'allergies',
          'chronicConditions',
          'currentMedications',
          'emergencyContactName',
          'emergencyContactPhone',
          'insuranceProvider',
        ].filter((field) => {
          const val = (profile as any)[field];
          return val != null && (Array.isArray(val) ? val.length > 0 : true);
        }),
      },
    });

    // Also create an audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'PROFILE_QR_LOOKUP',
        entityType: 'EmergencyProfile',
        entityId: profile.id,
        metadata: { qrToken: token },
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        bloodGroup: profile.bloodGroup,
        allergies: profile.allergies,
        chronicConditions: profile.chronicConditions,
        currentMedications: profile.currentMedications,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone,
        insuranceProvider: profile.insuranceProvider,
      },
      user: profile.user
        ? { name: profile.user.name }
        : null,
    });
  } catch (error) {
    console.error('[qr/scan] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
