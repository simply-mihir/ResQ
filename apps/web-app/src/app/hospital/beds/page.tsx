export const dynamic = "force-dynamic";

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BedManagementClient from './BedManagementClient';

export default async function BedsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Try to find the hospital linked to the authenticated user's orgId
  let hospital = null;
  if (user.orgId) {
    hospital = await prisma.hospital.findUnique({
      where: { id: user.orgId },
    });
  }

  // Fallback to first hospital for MVP
  if (!hospital) {
    hospital = await prisma.hospital.findFirst();
  }

  if (!hospital) {
    return <div className="p-8 text-center text-neutral-500">No hospital found. Please run database seed.</div>;
  }

  return <BedManagementClient hospital={hospital} />;
}
