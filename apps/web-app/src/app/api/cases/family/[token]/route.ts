import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const emergencyCase = await prisma.emergencyCase.findUnique({
      where: { familyToken: params.token },
      include: {
        assignedHospital: {
          select: {
            id: true,
            name: true,
            locationLat: true,
            locationLng: true,
            address: true,
            phone: true,
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
        triggeredBy: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!emergencyCase) {
      return NextResponse.json(
        { error: 'Case not found or invalid family token' },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (
      emergencyCase.familyTokenExpiresAt &&
      new Date() > emergencyCase.familyTokenExpiresAt
    ) {
      return NextResponse.json(
        { error: 'Family tracking link has expired' },
        { status: 410 }
      );
    }

    // Return limited fields for privacy
    const response = {
      id: emergencyCase.id,
      caseNumber: emergencyCase.caseNumber,
      status: emergencyCase.status,
      locationLat: emergencyCase.locationLat,
      locationLng: emergencyCase.locationLng,
      locationAddress: emergencyCase.locationAddress,
      severityTier: emergencyCase.severityTier,
      createdAt: emergencyCase.createdAt,
      dispatchedAt: emergencyCase.dispatchedAt,
      arrivedAt: emergencyCase.arrivedAt,
      etaMinutes: emergencyCase.etaMinutes,
      patientName: emergencyCase.triggeredBy?.name || 'Patient',
      assignedHospital: emergencyCase.assignedHospital,
      assignedAmbulance: emergencyCase.assignedAmbulance
        ? {
            vehicleNumber: emergencyCase.assignedAmbulance.vehicleNumber,
            status: emergencyCase.assignedAmbulance.status,
          }
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch family case:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
