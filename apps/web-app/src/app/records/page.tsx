export const dynamic = "force-dynamic";

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import RecordsTimelineClient from './RecordsTimelineClient';

export default async function RecordsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const records = await prisma.medicalRecordEntry.findMany({
    where: { patientId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return <RecordsTimelineClient initialRecords={records} patientId={user.id} />;
}
