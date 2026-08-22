import { prisma } from '@/lib/prisma';
import ReviewQueueClient from './ReviewQueueClient';

export default async function ReviewQueuePage() {
  const records = await prisma.medicalRecordEntry.findMany({
    where: { status: 'AI_EXTRACTED' },
    orderBy: { createdAt: 'desc' }
  });

  return <ReviewQueueClient records={records} />;
}
