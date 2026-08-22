'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getHospitalStats(hospitalId: string) {
  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId }
  });

  if (!hospital) throw new Error("Hospital not found");
  return hospital;
}

export async function updateBeds(hospitalId: string, freeBeds: number) {
  await prisma.hospital.update({
    where: { id: hospitalId },
    data: {
      bedCapacityFree: freeBeds,
      bedUpdatedAt: new Date(),
    }
  });

  revalidatePath('/beds');
}
