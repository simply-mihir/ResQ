'use server';

import { prisma } from '@/lib/prisma';

export async function getRecordsForPatient(patientId: string) {
  return prisma.medicalRecordEntry.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}
