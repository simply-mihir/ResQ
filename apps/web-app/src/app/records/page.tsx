export const dynamic = "force-dynamic";

import { prisma } from '@/lib/prisma';
import RecordsTimelineClient from './RecordsTimelineClient';

export default async function RecordsPage() {
  // For MVP, fetch records for the seeded user. If no user, create a dummy patientId
  let user = await prisma.user.findFirst();
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        role: 'PATIENT',
        name: 'John Doe MVP'
      }
    });
  }

  const records = await prisma.medicalRecordEntry.findMany({
    where: { patientId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return <RecordsTimelineClient initialRecords={records} patientId={user.id} />;
}
