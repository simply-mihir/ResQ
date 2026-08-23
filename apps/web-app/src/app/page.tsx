'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassBackground } from '@/components/layout/GlassBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { api } from '@/lib/api';

export default function EmergencyLanding() {
  const router = useRouter();
  const [triggering, setTriggering] = useState(false);
  const [locationText, setLocationText] = useState("Auto-detecting location...");

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocationText(`Location Active: ${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`),
        (err) => setLocationText("Location Unavailable")
      );
    }
  }, []);

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
          
          // Phase 1.2: Dispatch ambulance immediately
          try {
            await api.dispatch.dispatchAmbulance(caseId);
          } catch (dispatchErr) {
            console.error("Failed to auto-dispatch:", dispatchErr);
            // Non-fatal for the flow, we still go to triage
          }

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
        <button onClick={() => router.push('/profile/emergency')} className="text-sm text-primary-600 font-medium hover:text-primary-700">
          My Profile
        </button>
      </GlassNavbar>

      <main className="flex flex-col items-center justify-center min-h-screen px-4 pt-16 pb-8">
        
        {/* Location Chip */}
        <div className="mb-6 px-4 py-2 bg-white/50 backdrop-blur-sm border border-neutral-200 rounded-full flex items-center gap-2 shadow-sm">
          <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium text-neutral-600">{locationText}</span>
        </div>

        {/* Emergency trigger — the hero of this screen */}
        <div className="mb-12">
          <button 
            onClick={handleEmergencyTrigger}
            disabled={triggering}
            className={`w-64 h-64 rounded-full flex flex-col items-center justify-center text-white transition-all duration-300 shadow-2xl relative overflow-hidden group
              ${triggering ? 'bg-red-700 scale-95' : 'bg-red-500 hover:bg-red-600 hover:scale-105 animate-pulse-slow'}
            `}
            style={{
              boxShadow: '0 20px 40px -10px rgba(239,68,68,0.5), inset 0 -10px 20px rgba(0,0,0,0.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            
            <svg className="w-20 h-20 mb-2 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-2xl font-bold tracking-wider relative z-10">SOS</span>
            <span className="text-sm opacity-80 mt-1 relative z-10">{triggering ? 'Dispatching...' : 'Tap for Ambulance'}</span>
          </button>
        </div>

        {/* QR Section */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-4">
          <GlassCard level={1} padding="md" hover onClick={() => router.push('/my-qr')}>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="font-medium text-neutral-800 text-sm">My QR</h3>
            </div>
          </GlassCard>

          <GlassCard level={1} padding="md" hover onClick={() => router.push('/scan-qr')}>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-neutral-800 text-sm">Scan QR</h3>
            </div>
          </GlassCard>
        </div>

        {/* Secondary Info cards */}
        <div className="w-full max-w-sm space-y-4">
          <GlassCard level={1} padding="md" hover onClick={() => router.push('/records')}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-neutral-800 text-sm">Medical Records</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  View and manage your health history
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard level={1} padding="md" hover onClick={() => router.push('/profile/emergency')}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-neutral-800 text-sm">Emergency Contacts</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Manage who to notify in an emergency
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </GlassBackground>
  );
}
