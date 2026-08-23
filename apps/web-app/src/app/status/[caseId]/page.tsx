'use client';

import { GlassBackground } from '@/components/layout/GlassBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { SimulatedBadge } from '@/components/ui/SimulatedBadge';

export default function StatusScreen({ params }: { params: { caseId: string } }) {
  return (
    <GlassBackground variant="calm">
      <GlassNavbar variant="transparent">
        <span className="font-semibold text-neutral-800">Live Status</span>
      </GlassNavbar>

      <main className="flex flex-col min-h-screen pt-16">
        
        {/* Map Placeholder Area (Animated) */}
        <div className="flex-1 relative bg-neutral-100 overflow-hidden">
          {/* Static Map Grid Background */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          {/* Fake polyline route */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M 20 80 Q 40 40 80 20" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
          </svg>

          {/* Animated Ambulance Icon */}
          <div className="absolute w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center animate-[moveAmbulance_10s_ease-in-out_infinite] z-10" style={{ offsetPath: 'path("M 20 80 Q 40 40 80 20")', offsetRotate: 'auto' }}>
            <span className="text-lg">🚑</span>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
             <GlassCard level={1} padding="md" className="backdrop-blur-md bg-white/90">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="font-bold text-neutral-800 text-lg">ETA: 4 mins <SimulatedBadge /></h3>
                   <span className="text-primary-600 font-semibold text-sm bg-primary-50 px-2 py-1 rounded-md">On the way</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-neutral-200 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                     <img src="https://ui-avatars.com/api/?name=Ramesh+K&background=random" alt="Driver" className="w-full h-full object-cover" />
                   </div>
                   <div>
                      <p className="font-medium text-neutral-800">Ramesh K.</p>
                      <p className="text-sm text-neutral-500">Ambulance MH-12-AB-1234</p>
                   </div>
                </div>
             </GlassCard>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] p-6 z-20">
           <h4 className="font-semibold text-neutral-800 mb-4">Case #{params.caseId.slice(-6).toUpperCase()}</h4>
           
           <div className="space-y-4">
              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-0.5 h-full bg-green-200 my-1"></div>
                 </div>
                 <div className="pb-4">
                    <p className="font-medium text-neutral-800 text-sm">Emergency Triggered</p>
                    <p className="text-xs text-neutral-500">Location detected successfully</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-0.5 h-full bg-neutral-200 my-1"></div>
                 </div>
                 <div className="pb-4">
                    <p className="font-medium text-neutral-800 text-sm">Ambulance Dispatched</p>
                    <p className="text-xs text-neutral-500">ALS Unit dispatched to your location</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                 </div>
                 <div>
                    <p className="font-medium text-primary-700 text-sm">Hospital Assignment</p>
                    <p className="text-xs text-neutral-500">Finding best hospital based on triage <SimulatedBadge /></p>
                 </div>
              </div>
           </div>
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
