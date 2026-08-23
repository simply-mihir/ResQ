'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FuturisticPatientLayout from '@/components/layout/FuturisticPatientLayout';
import { api } from '@/lib/api';
import { ShieldAlert, MapPin, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

export default function EmergencyTriage() {
  const router = useRouter();
  const [triggering, setTriggering] = useState(false);
  const [locationText, setLocationText] = useState("Detecting geo-coordinates...");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const [triage, setTriage] = useState({
    conscious: true,
    breathing: true,
    bleeding: false,
    cardiac: false,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationText(`Active: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        (err) => {
          setLocationText("Failed to auto-detect. Using fallback coordinates.");
          setLocation({ lat: 28.6139, lng: 77.2090 });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const handleDispatch = async () => {
    setTriggering(true);
    try {
      const lat = location?.lat || 28.6139;
      const lng = location?.lng || 77.2090;

      // In a real app we'd pass the triage data, for now we just trigger SOS
      const { caseId } = await api.emergency.trigger(lat, lng);
      
      try {
        await api.dispatch.dispatchAmbulance(caseId);
      } catch (err) {
        console.warn("Auto-dispatch failed, network will handle it.", err);
      }

      router.push(`/status/${caseId}`);
    } catch (error) {
      console.error(error);
      alert("Failed to connect to emergency network.");
      setTriggering(false);
    }
  };

  const TriageButton = ({ label, active, onClick, critical = false }: any) => (
    <button
      onClick={onClick}
      type="button"
      className={`px-6 py-4 rounded-xl border flex-1 text-sm font-bold tracking-widest uppercase transition-all ${
        active 
          ? critical 
            ? 'bg-emergency-500/20 border-emergency-500 text-emergency-500 shadow-emergency' 
            : 'bg-neon-lime/10 border-neon-lime text-neon-lime shadow-neon-lime'
          : 'bg-dark-bg border-white/10 text-neutral-500 hover:border-white/30'
      }`}
    >
      {label}
    </button>
  );

  return (
    <FuturisticPatientLayout>
      <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
        
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-emergency-500/10 border border-emergency-500/30 flex items-center justify-center shadow-emergency mb-6">
            <AlertTriangle className="w-8 h-8 text-emergency-500" />
          </div>
          <h1 className="text-3xl text-white tracking-widest glow-text">Emergency Triage</h1>
          <p className="text-neutral-400 mt-2 tracking-wider text-sm max-w-md">
            Please provide quick details about the emergency. This intelligence helps us dispatch the appropriate medical unit.
          </p>
        </div>

        <div className="futuristic-card p-8 space-y-8 border-emergency-500/20">
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-neon-cyan animate-pulse" />
              <div>
                <p className="text-xs text-neutral-400 tracking-widest uppercase font-bold">Location Sync</p>
                <p className="text-white text-sm tracking-wide mt-1">{locationText}</p>
              </div>
            </div>
            {location && <CheckCircle className="w-5 h-5 text-neon-lime" />}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs text-neutral-400 tracking-widest uppercase font-bold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-neon-lime" /> Is the patient conscious?
              </p>
              <div className="flex gap-4">
                <TriageButton label="Yes" active={triage.conscious} onClick={() => setTriage({...triage, conscious: true})} />
                <TriageButton label="No" active={!triage.conscious} onClick={() => setTriage({...triage, conscious: false})} critical />
              </div>
            </div>

            <div>
              <p className="text-xs text-neutral-400 tracking-widest uppercase font-bold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-neon-lime" /> Is the patient breathing normally?
              </p>
              <div className="flex gap-4">
                <TriageButton label="Yes" active={triage.breathing} onClick={() => setTriage({...triage, breathing: true})} />
                <TriageButton label="No" active={!triage.breathing} onClick={() => setTriage({...triage, breathing: false})} critical />
              </div>
            </div>

            <div>
              <p className="text-xs text-neutral-400 tracking-widest uppercase font-bold mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emergency-500" /> Severe Bleeding?
              </p>
              <div className="flex gap-4">
                <TriageButton label="Yes" active={triage.bleeding} onClick={() => setTriage({...triage, bleeding: true})} critical />
                <TriageButton label="No" active={!triage.bleeding} onClick={() => setTriage({...triage, bleeding: false})} />
              </div>
            </div>
            
            <div>
              <p className="text-xs text-neutral-400 tracking-widest uppercase font-bold mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emergency-500" /> Suspected Cardiac Issue?
              </p>
              <div className="flex gap-4">
                <TriageButton label="Yes" active={triage.cardiac} onClick={() => setTriage({...triage, cardiac: true})} critical />
                <TriageButton label="No" active={!triage.cardiac} onClick={() => setTriage({...triage, cardiac: false})} />
              </div>
            </div>
          </div>

          <button
            onClick={handleDispatch}
            disabled={triggering || !location}
            className={`w-full py-5 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3 text-lg ${
              triggering
                ? 'bg-emergency-700 text-white cursor-not-allowed'
                : 'bg-emergency-500 text-white hover:bg-emergency-400 shadow-emergency hover:scale-[1.02]'
            }`}
          >
            {triggering ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Dispatching Unit...
              </>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6" /> Dispatch Ambulance Now
              </>
            )}
          </button>
          
        </div>

      </div>
    </FuturisticPatientLayout>
  );
}
