import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { caseId } = await req.json();

    if (!caseId) {
      return NextResponse.json({ error: 'caseId required' }, { status: 400 });
    }

    const emergencyCase = await prisma.emergencyCase.findUnique({ where: { id: caseId } });
    if (!emergencyCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Find the nearest available ambulance
    const ambulance = await prisma.ambulance.findFirst({
      where: { status: 'AVAILABLE' },
    });

    if (ambulance) {
      // Assign the ambulance
      await prisma.ambulance.update({
        where: { id: ambulance.id },
        data: { status: 'DISPATCHED' },
      });

      await prisma.emergencyCase.update({
        where: { id: caseId },
        data: {
          assignedAmbulanceId: ambulance.id,
          status: 'DISPATCHED',
          dispatchedAt: new Date(),
        },
      });

      // Record status change
      await prisma.caseStatusHistory.create({
        data: {
          caseId,
          fromStatus: emergencyCase.status,
          toStatus: 'DISPATCHED',
          changedBy: 'system',
          notes: `Ambulance ${ambulance.vehicleNumber} dispatched`,
        },
      });

      return NextResponse.json({
        dispatched: true,
        ambulanceId: ambulance.id,
        vehicleNumber: ambulance.vehicleNumber,
      });
    }

    // No ambulance available — still mark case as dispatched for flow continuity
    await prisma.emergencyCase.update({
      where: { id: caseId },
      data: {
        status: 'DISPATCHED',
        dispatchedAt: new Date(),
      },
    });

    return NextResponse.json({
      dispatched: false,
      message: 'No ambulances available at the moment. Emergency services notified.',
    });
  } catch (error) {
    console.error('[dispatch/ambulance] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
