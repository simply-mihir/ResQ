import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const activeCasesCount = await prisma.emergencyCase.count({
      where: {
        status: {
          in: ['TRIGGERED', 'DISPATCHED', 'EN_ROUTE_TO_PATIENT', 'AT_PATIENT', 'EN_ROUTE_TO_HOSPITAL']
        }
      }
    });

    const totalHospitals = await prisma.hospital.count();
    const activeHospitals = await prisma.hospital.count({ where: { verifiedPartner: true } });

    const totalAmbulances = await prisma.ambulance.count();
    const activeAmbulances = await prisma.ambulance.count({
      where: { status: { not: 'OFFLINE' } }
    });

    const totalPatients = await prisma.user.count({ where: { role: 'PATIENT' } });

    const recentHospitals = await prisma.hospital.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' }
    });

    const liveNetwork = await prisma.emergencyCase.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        triggeredBy: true,
        assignedHospital: true,
        assignedAmbulance: true
      }
    });

    const systemActivity = await prisma.caseStatusHistory.findMany({
      take: 5,
      orderBy: { changedAt: 'desc' },
      include: {
        case: {
          include: { assignedHospital: true, assignedAmbulance: true, triggeredBy: true }
        }
      }
    });

    return NextResponse.json({
      metrics: {
        activeCases: activeCasesCount,
        hospitalsTotal: totalHospitals,
        hospitalsActive: activeHospitals,
        ambulancesTotal: totalAmbulances,
        ambulancesActive: activeAmbulances,
        patientsAssisted: totalPatients,
      },
      hospitals: recentHospitals.map(h => ({
        id: h.id,
        name: h.name,
        loc: h.address ? h.address.split(',')[0] : 'Unknown',
        stat: h.verifiedPartner ? 'Online' : 'Offline',
        beds: h.bedCapacityFree,
        totalBeds: h.bedCapacityTotal
      })),
      cases: liveNetwork.map(c => ({
        id: c.caseNumber,
        name: c.triggeredBy?.name || 'Unknown',
        sev: c.severityTier || 'Pending',
        dest: c.assignedHospital?.name || 'Pending',
        amb: c.assignedAmbulance?.vehicleNumber || 'Unassigned',
        stat: c.status,
        eta: c.etaMinutes ? `${c.etaMinutes} min` : 'Calculating'
      })),
      activity: systemActivity.map(a => ({
        id: a.id,
        time: new Date(a.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        msg: `Status changed to ${a.toStatus}`,
        detail: a.notes || `Case ${a.case.caseNumber}`,
        type: a.toStatus === 'TRIGGERED' ? 'red' : a.toStatus === 'DISPATCHED' ? 'blue' : 'green'
      }))
    });
  } catch (error) {
    console.error('Failed to fetch admin overview:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
