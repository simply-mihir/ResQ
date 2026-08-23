export const dynamic = "force-dynamic";

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import EmergencyProfileForm from './EmergencyProfileForm';

export default async function EmergencyProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const profile = user.emergencyProfile;

  return (
    <EmergencyProfileForm
      userId={user.id}
      userName={user.name || ''}
      profile={profile ? {
        id: profile.id,
        bloodGroup: profile.bloodGroup || '',
        allergies: profile.allergies,
        chronicConditions: profile.chronicConditions,
        currentMedications: profile.currentMedications,
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || '',
        insuranceProvider: profile.insuranceProvider || '',
        insurancePolicyNumber: profile.insurancePolicyNumber || '',
        qrToken: profile.qrToken,
      } : null}
    />
  );
}
