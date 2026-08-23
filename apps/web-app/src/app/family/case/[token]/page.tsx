'use client';

import { useState, useEffect } from 'react';
import { GlassBackground } from '@/components/layout/GlassBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { SimulatedBadge } from '@/components/ui/SimulatedBadge';

export default function FamilyTrackingScreen({ params }: { params: { token: string } }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassBackground variant="calm">
      <GlassNavbar variant="transparent">
        <span className="font-semibold text-neutral-800">Family Tracker</span>
      </GlassNavbar>

      <main className="max-w-md mx-auto px-4 pt-20 pb-24 min-h-screen flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Live Status</h1>
          <p className="text-neutral-600 text-sm mt-1">Tracking emergency case securely.</p>
        </div>

        {/* Map Placeholder Area (Animated) */}
        <div className="relative bg-neutral-100 overflow-hidden h-64 rounded-3xl mb-6 shadow-inner border border-neutral-200">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M 20 80 Q 40 40 80 20" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
          </svg>
          <div className="absolute w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center animate-[moveAmbulance_10s_ease-in-out_infinite] z-10" style={{ offsetPath: 'path("M 20 80 Q 40 40 80 20")', offsetRotate: 'auto' }}>
            <span className="text-lg">🚑</span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
             <GlassCard level={1} padding="sm" className="backdrop-blur-md bg-white/90">
                <div className="flex justify-between items-center">
                   <h3 className="font-bold text-neutral-800 text-md">ETA: 4 mins <SimulatedBadge /></h3>
                   <span className="text-primary-600 font-semibold text-xs bg-primary-50 px-2 py-1 rounded-md">On the way to hospital</span>
                </div>
             </GlassCard>
          </div>
        </div>

        {/* Status Timeline */}
        <GlassCard level={2} padding="md" className="mb-6">
           <h4 className="font-semibold text-neutral-800 mb-4">Case Timeline</h4>
           <div className="space-y-4">
              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-0.5 h-full bg-green-200 my-1"></div>
                 </div>
                 <div className="pb-4">
                    <p className="font-medium text-neutral-800 text-sm">Emergency Triggered</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-0.5 h-full bg-green-200 my-1"></div>
                 </div>
                 <div className="pb-4">
                    <p className="font-medium text-neutral-800 text-sm">Ambulance Dispatched</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"></div>
                    <div className="w-0.5 h-full bg-neutral-200 my-1"></div>
                 </div>
                 <div className="pb-4">
                    <p className="font-medium text-primary-700 text-sm">En Route to Hospital</p>
                    <p className="text-xs text-neutral-500">Destination: Apollo Hospital <SimulatedBadge /></p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-neutral-300 rounded-full"></div>
                 </div>
                 <div>
                    <p className="font-medium text-neutral-500 text-sm">Arrived / Admitted</p>
                 </div>
              </div>
           </div>
        </GlassCard>

        {/* Quick Actions */}
        <h4 className="font-semibold text-neutral-800 mb-3 ml-1">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleCopyLink} className="bg-white hover:bg-neutral-50 text-primary-700 border border-primary-100 font-semibold py-3 rounded-xl shadow-sm transition-colors text-sm">
            {copied ? 'Link Copied!' : 'Share Live Link'}
          </button>
          <button className="bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 font-semibold py-3 rounded-xl shadow-sm transition-colors text-sm" onClick={() => alert('Insurance upload simulated')}>
            Upload Insurance
          </button>
          <button className="bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 font-semibold py-3 rounded-xl shadow-sm transition-colors text-sm col-span-2" onClick={() => alert('Call hospital simulated')}>
            Contact Hospital
          </button>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes moveAmbulance {
          0% { offset-distance: 0%; }
          50% { offset-distance: 100%; }
          100% { offset-distance: 0%; }
        }
      `}} />
    </GlassBackground>
  );
}
