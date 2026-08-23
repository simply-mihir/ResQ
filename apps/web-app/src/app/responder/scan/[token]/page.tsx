'use client';

import { useState, useEffect } from 'react';
import { GlassBackground } from '@/components/layout/GlassBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { SimulatedBadge } from '@/components/ui/SimulatedBadge';
import { api } from '@/lib/api';

export default function ResponderScanScreen({ params }: { params: { token: string } }) {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate logging the scan securely on the backend
    async function logScan() {
      try {
        await api.responder.logQrScan(params.token, { lat: 37.7749, lng: -122.4194 }); // Mock location
        setScanned(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    logScan();
  }, [params.token]);

  return (
    <GlassBackground variant="calm">
      <GlassNavbar variant="transparent">
        <span className="font-semibold text-neutral-800">First Responder View</span>
      </GlassNavbar>

      <main className="max-w-md mx-auto px-4 pt-20 pb-24 min-h-screen flex flex-col">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
             <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
             <p className="mt-4 font-medium text-neutral-500">Decrypting Medical ID...</p>
           </div>
        ) : (
           <>
              <div className="mb-6">
                 <h1 className="text-2xl font-bold text-neutral-900">Medical ID</h1>
                 <p className="text-emerald-600 text-sm font-semibold mt-1 flex items-center gap-1">
                    ✓ Verified Identity <SimulatedBadge />
                 </p>
              </div>

              <GlassCard level={2} padding="md" className="mb-6 border-l-4 border-l-red-500">
                 <h3 className="text-xs uppercase font-bold text-neutral-500 tracking-wider mb-2">Blood Type & Vitals</h3>
                 <div className="flex items-center gap-6">
                    <div>
                       <span className="block text-3xl font-black text-red-600">O+</span>
                       <span className="text-xs text-neutral-500">Blood</span>
                    </div>
                    <div>
                       <span className="block text-xl font-bold text-neutral-800">72 bpm</span>
                       <span className="text-xs text-neutral-500">Avg Heart Rate</span>
                    </div>
                 </div>
              </GlassCard>

              <GlassCard level={2} padding="md" className="mb-6">
                 <h3 className="text-xs uppercase font-bold text-neutral-500 tracking-wider mb-3">Critical Medical Info</h3>
                 
                 <div className="space-y-4">
                    <div>
                       <span className="block text-sm font-semibold text-neutral-800">Allergies</span>
                       <p className="text-red-500 font-medium bg-red-50 py-1 px-2 rounded-md inline-block mt-1">Penicillin</p>
                    </div>
                    <div>
                       <span className="block text-sm font-semibold text-neutral-800">Pre-existing Conditions</span>
                       <p className="text-neutral-600 text-sm mt-1">Type 2 Diabetes, Mild Asthma</p>
                    </div>
                    <div>
                       <span className="block text-sm font-semibold text-neutral-800">Current Medications</span>
                       <p className="text-neutral-600 text-sm mt-1">Metformin (500mg daily), Albuterol Inhaler (as needed)</p>
                    </div>
                 </div>
              </GlassCard>

              <GlassCard level={2} padding="md">
                 <h3 className="text-xs uppercase font-bold text-neutral-500 tracking-wider mb-3">Emergency Contacts</h3>
                 <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-neutral-100">
                    <div>
                       <span className="block font-semibold text-neutral-800">Jane Doe (Wife)</span>
                       <span className="text-xs text-neutral-500">+1 (555) 019-8234</span>
                    </div>
                    <button className="bg-primary-50 text-primary-600 p-2 rounded-lg font-bold">
                       Call
                    </button>
                 </div>
              </GlassCard>
           </>
        )}
      </main>
    </GlassBackground>
  );
}
