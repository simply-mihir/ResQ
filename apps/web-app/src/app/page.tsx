'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassBackground } from '@/components/layout/GlassBackground';
import { EmergencyButton } from '@/components/ui/EmergencyButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { api } from '@/lib/api';

export default function EmergencyLanding() {
  const router = useRouter();
  const [triggering, setTriggering] = useState(false);

  const handleEmergencyTrigger = async () => {
    setTriggering(true);
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setTriggering(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const { caseId } = await api.emergency.trigger(latitude, longitude);
          router.push(`/triage/${caseId}`);
        } catch (error) {
          console.error(error);
          alert("Failed to connect to emergency services. Please call 112 directly.");
          setTriggering(false);
        }
      },
      (error) => {
        console.error(error);
        alert("We need your location to dispatch an ambulance. Please enable it.");
        setTriggering(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <GlassBackground variant="default">
      <GlassNavbar variant="transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="font-semibold text-neutral-800">HEALTH</span>
        </div>
        <button className="text-sm text-primary-600 font-medium hover:text-primary-700">
          My Profile
        </button>
      </GlassNavbar>

      <main className="flex flex-col items-center justify-center min-h-screen px-4 pt-16">
        {/* Emergency trigger — the hero of this screen */}
        <div className="mb-12">
          <EmergencyButton onTrigger={handleEmergencyTrigger} />
        </div>

        {/* Info cards below the button */}
        <div className="w-full max-w-sm space-y-4">
          <GlassCard level={1} padding="md">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-neutral-800 text-sm">No login needed</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Tap the button to get help immediately. No account required.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard level={1} padding="md" hover onClick={() => { /* navigate to profile setup */ }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-neutral-800 text-sm">Set up Emergency Profile</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Save your blood group, allergies & emergency contact. Get a QR for your wallet.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </GlassBackground>
  );
}
