import BedManagementClient from './BedManagementClient';
import { prisma } from '@/lib/prisma';

export default async function BedsPage() {
  // For the MVP, we just fetch the first hospital in the DB since we seeded 2.
  // In a real app, we'd use the logged in user's orgId.
  const hospital = await prisma.hospital.findFirst();

  if (!hospital) {
    return <div className="p-8 text-center text-neutral-500">No hospital found. Please run database seed.</div>;
  }

  return <BedManagementClient hospital={hospital} />;
}
