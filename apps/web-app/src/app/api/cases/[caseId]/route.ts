import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  try {
    const emergencyCase = await prisma.emergencyCase.findUnique({
      where: { id: params.caseId },
      include: {
        assignedHospital: {
          select: {
            id: true,
            name: true,
            locationLat: true,
            locationLng: true,
            address: true,
            phone: true,
            specialties: true,
          },
        },
        assignedAmbulance: {
          select: {
            id: true,
            vehicleNumber: true,
            status: true,
            currentLat: true,
            currentLng: true,
          },
        },
        emergencyProfile: {
          select: {
            bloodGroup: true,
            allergies: true,
            chronicConditions: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
          },
        },
        triggeredBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!emergencyCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(emergencyCase);
  } catch (error) {
    console.error('Failed to fetch case:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
