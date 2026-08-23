'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function verifyRecord(recordId: string, extractedData: any) {
  await prisma.medicalRecordEntry.update({
    where: { id: recordId },
    data: {
      status: 'VERIFIED',
      extractedData: extractedData,
      reviewedAt: new Date()
    }
  });

  revalidatePath('/records');
}
