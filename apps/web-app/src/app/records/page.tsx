export const dynamic = "force-dynamic";

import { prisma } from '@/lib/prisma';
import RecordsTimelineClient from './RecordsTimelineClient';

export default async function RecordsPage() {
  if (!process.env.DATABASE_URL) {
    return <div className="flex items-center justify-center min-h-screen">Loading Records...</div>;
  }

  // For MVP, fetch records for the seeded user. If no user, create a dummy patientId
  let user;
  try {
    user = await prisma.user.findFirst();
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          role: 'PATIENT',
          name: 'John Doe MVP'
        }
      });
    }
  } catch (error) {
    console.warn("Prisma failed to connect during build/render:", error);
    return <div className="flex items-center justify-center min-h-screen">Database Connection Error</div>;
  }

  const records = await prisma.medicalRecordEntry.findMany({
    where: { patientId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return <RecordsTimelineClient initialRecords={records} patientId={user.id} />;
}
