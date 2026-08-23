'use client';

import { useState, useEffect } from 'react';
import { GlassBackground } from '@/components/layout/GlassBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { api } from '@/lib/api';

interface ProfileData {
  bloodGroup: string | null;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  insuranceProvider: string | null;
}

export default function ResponderScanScreen({ params }: { params: { token: string } }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userName, setUserName] = useState<string>('Unknown Patient');

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.responder.getProfile(params.token);
        setProfile(data.profile);
        setUserName(data.user?.name || 'Unknown Patient');
      } catch (e) {
        console.error(e);
        setError('Invalid QR token or patient not found.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [params.token]);

  return (
    <GlassBackground variant="calm">
      <GlassNavbar variant="transparent" backUrl="/">
        <span className="font-semibold text-neutral-800">First Responder View</span>
      </GlassNavbar>

      <main className="max-w-md mx-auto px-4 pt-20 pb-24 min-h-screen flex flex-col">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
             <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
             <p className="mt-4 font-medium text-neutral-500">Loading Medical ID...</p>
           </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center py-20">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </div>
             <p className="text-red-600 font-medium">{error}</p>
           </div>
        ) : profile ? (
           <>
              <div className="mb-6">
                 <h1 className="text-2xl font-bold text-neutral-900">Medical ID</h1>
                 <p className="text-emerald-600 text-sm font-semibold mt-1 flex items-center gap-1">
                    ✓ Verified Identity — {userName}
                 </p>
              </div>

              <GlassCard level={2} padding="md" className="mb-6 border-l-4 border-l-red-500">
                 <h3 className="text-xs uppercase font-bold text-neutral-500 tracking-wider mb-2">Blood Type</h3>
                 <div className="flex items-center gap-6">
                    <div>
                       <span className="block text-3xl font-black text-red-600">{profile.bloodGroup || 'Unknown'}</span>
                       <span className="text-xs text-neutral-500">Blood Group</span>
                    </div>
                 </div>
              </GlassCard>

              <GlassCard level={2} padding="md" className="mb-6">
                 <h3 className="text-xs uppercase font-bold text-neutral-500 tracking-wider mb-3">Critical Medical Info</h3>

                 <div className="space-y-4">
                    <div>
                       <span className="block text-sm font-semibold text-neutral-800">Allergies</span>
                       {profile.allergies.length > 0 ? (
                         <div className="flex flex-wrap gap-2 mt-1">
                           {profile.allergies.map((allergy) => (
                             <span key={allergy} className="text-red-500 font-medium bg-red-50 py-1 px-2 rounded-md">{allergy}</span>
                           ))}
                         </div>
                       ) : (
                         <p className="text-neutral-500 text-sm mt-1">None known</p>
                       )}
                    </div>
                    <div>
                       <span className="block text-sm font-semibold text-neutral-800">Pre-existing Conditions</span>
                       {profile.chronicConditions.length > 0 ? (
                         <p className="text-neutral-600 text-sm mt-1">{profile.chronicConditions.join(', ')}</p>
                       ) : (
                         <p className="text-neutral-500 text-sm mt-1">None known</p>
                       )}
                    </div>
                    <div>
                       <span className="block text-sm font-semibold text-neutral-800">Current Medications</span>
                       {profile.currentMedications.length > 0 ? (
                         <p className="text-neutral-600 text-sm mt-1">{profile.currentMedications.join(', ')}</p>
                       ) : (
                         <p className="text-neutral-500 text-sm mt-1">None</p>
                       )}
                    </div>
                 </div>
              </GlassCard>

              <GlassCard level={2} padding="md">
                 <h3 className="text-xs uppercase font-bold text-neutral-500 tracking-wider mb-3">Emergency Contact</h3>
                 {profile.emergencyContactName ? (
                   <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-neutral-100">
                      <div>
                         <span className="block font-semibold text-neutral-800">{profile.emergencyContactName}</span>
                         <span className="text-xs text-neutral-500">{profile.emergencyContactPhone || 'No phone'}</span>
                      </div>
                      {profile.emergencyContactPhone && (
                        <a href={`tel:${profile.emergencyContactPhone}`} className="bg-primary-50 text-primary-600 p-2 rounded-lg font-bold">
                           Call
                        </a>
                      )}
                   </div>
                 ) : (
                   <p className="text-neutral-500 text-sm">No emergency contact on file</p>
                 )}
              </GlassCard>

              {profile.insuranceProvider && (
                <GlassCard level={2} padding="md" className="mt-6">
                   <h3 className="text-xs uppercase font-bold text-neutral-500 tracking-wider mb-2">Insurance</h3>
                   <p className="font-medium text-neutral-800">{profile.insuranceProvider}</p>
                </GlassCard>
              )}
           </>
        ) : null}
      </main>
    </GlassBackground>
  );
}
