'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FuturisticPatientLayout from '@/components/layout/FuturisticPatientLayout';
import { AlertTriangle, MapPin, Activity, Calendar, ShieldAlert, User } from 'lucide-react';
import { api } from '@/lib/api';

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data?.user) setUser(data.user); })
      .catch(console.error);
  }, []);

  const handleQuickSOS = async () => {
    setTriggering(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { caseId } = await api.emergency.trigger(pos.coords.latitude, pos.coords.longitude);
          router.push(`/status/${caseId}`);
        }, async () => {
          const { caseId } = await api.emergency.trigger(28.6139, 77.2090); // Fallback
          router.push(`/status/${caseId}`);
        });
      } else {
        const { caseId } = await api.emergency.trigger(28.6139, 77.2090); // Fallback
        router.push(`/status/${caseId}`);
      }
    } catch (error) {
      console.error(error);
      setTriggering(false);
      alert("Failed to connect to emergency network.");
    }
  };

  return (
    <FuturisticPatientLayout>
      <div className="space-y-8 animate-fade-in">
        
        {/* Header / Welcome */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-neon-lime animate-neon-pulse shadow-neon-lime" />
              <span className="text-neon-lime text-xs tracking-[0.3em] font-bold uppercase">System Active</span>
            </div>
            <h1 className="text-4xl md:text-5xl text-white tracking-wide glow-text">
              Welcome, <span className="text-neon-lime">{user?.name?.split(' ')[0] || 'Patient'}</span>
            </h1>
            <p className="text-neutral-400 mt-2 tracking-wider">Your personal health and emergency network.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Network Status</p>
              <p className="text-neon-cyan text-sm tracking-wide font-bold">OPTIMAL</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-dark-card futuristic-border flex items-center justify-center">
              <Activity className="w-5 h-5 text-neon-cyan" />
            </div>
          </div>
        </div>

        {/* Main Action Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick SOS Card - Full span on mobile, 2 cols on desktop */}
          <div className="lg:col-span-2 futuristic-card p-8 flex flex-col md:flex-row items-center justify-between gap-8 group">
            <div className="flex-1">
              <h2 className="text-2xl text-white mb-2 tracking-wider">Emergency Response</h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Instantly connect with the nearest available ambulance and dispatch center. Auto-transmits your exact coordinates and medical profile.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => router.push('/sos')}
                  className="px-6 py-3 rounded-xl border border-white/10 hover:border-neon-lime hover:bg-neon-lime/5 text-white text-sm font-bold tracking-widest uppercase transition-all"
                >
                  Full Triage
                </button>
              </div>
            </div>

            <button
              onClick={handleQuickSOS}
              disabled={triggering}
              className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-2 border-emergency-500 shadow-emergency transition-all duration-300 relative overflow-hidden flex-shrink-0 ${triggering ? 'bg-emergency-600 scale-95' : 'bg-dark-bg hover:bg-emergency-500/20 hover:scale-105'}`}
            >
              <AlertTriangle className={`w-10 h-10 mb-2 ${triggering ? 'text-white' : 'text-emergency-500'} relative z-10`} />
              <span className={`text-xl tracking-widest font-bold relative z-10 ${triggering ? 'text-white' : 'text-emergency-500'}`}>
                {triggering ? 'SYS...' : 'S.O.S'}
              </span>
              {!triggering && (
                <div className="absolute inset-0 rounded-full border border-emergency-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20" />
              )}
            </button>
          </div>

          {/* Quick Stats / Mini Profile */}
          <div className="futuristic-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-neutral-500 tracking-[0.2em] uppercase font-bold">Vitals & Info</span>
              <User className="w-4 h-4 text-neon-cyan" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-xs text-neutral-400 tracking-wider">Blood Type</span>
                <span className="text-neon-lime font-bold">O+</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-xs text-neutral-400 tracking-wider">Allergies</span>
                <span className="text-neon-cyan font-bold">None</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-xs text-neutral-400 tracking-wider">Active Meds</span>
                <span className="text-white font-bold">0</span>
              </div>
            </div>

            <button onClick={() => router.push('/profile/emergency')} className="w-full mt-4 py-2 text-xs font-bold text-neutral-400 hover:text-neon-lime uppercase tracking-widest border border-white/10 rounded-lg hover:border-neon-lime/50 transition-colors">
              View Full Profile
            </button>
          </div>
        </div>

        {/* Secondary Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Upcoming Appointments */}
          <div className="futuristic-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg text-white tracking-widest">Scheduled Scans</h3>
              <Calendar className="w-5 h-5 text-neon-lime" />
            </div>
            
            <div className="flex flex-col items-center justify-center py-8 opacity-50">
              <div className="w-12 h-12 rounded-full border border-neon-lime/30 flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-neon-lime" />
              </div>
              <p className="text-sm text-neutral-400 tracking-wider">No active appointments.</p>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="futuristic-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg text-white tracking-widest">System Alerts</h3>
              <ShieldAlert className="w-5 h-5 text-neon-cyan" />
            </div>
            
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-neon-cyan mt-1.5 shadow-neon-cyan" />
                <div>
                  <p className="text-sm text-white font-bold tracking-wide">Network Nominal</p>
                  <p className="text-xs text-neutral-400 mt-1">Local emergency dispatch centers are operating at normal capacity.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </FuturisticPatientLayout>
  );
}
