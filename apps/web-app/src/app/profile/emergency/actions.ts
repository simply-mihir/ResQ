'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface ProfileInput {
  name: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
}

export async function saveProfile(userId: string, data: ProfileInput) {
  // Update user name
  await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
  });

  // Check if profile exists
  const existing = await prisma.emergencyProfile.findFirst({
    where: { userId },
  });

  if (existing) {
    await prisma.emergencyProfile.update({
      where: { id: existing.id },
      data: {
        bloodGroup: data.bloodGroup || null,
        allergies: data.allergies,
        chronicConditions: data.chronicConditions,
        currentMedications: data.currentMedications,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        insuranceProvider: data.insuranceProvider || null,
        insurancePolicyNumber: data.insurancePolicyNumber || null,
      },
    });
  } else {
    await prisma.emergencyProfile.create({
      data: {
        userId,
        bloodGroup: data.bloodGroup || null,
        allergies: data.allergies,
        chronicConditions: data.chronicConditions,
        currentMedications: data.currentMedications,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        insuranceProvider: data.insuranceProvider || null,
        insurancePolicyNumber: data.insurancePolicyNumber || null,
      },
    });
  }

  revalidatePath('/profile/emergency');
  revalidatePath('/my-qr');
}
