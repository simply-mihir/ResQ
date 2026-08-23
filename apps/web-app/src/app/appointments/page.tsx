'use client';

import React from 'react';
import FuturisticPatientLayout from '@/components/layout/FuturisticPatientLayout';
import { Calendar, Plus } from 'lucide-react';

export default function AppointmentsPage() {
  return (
    <FuturisticPatientLayout>
      <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-4 h-4 text-neon-cyan" />
              <span className="text-neon-cyan text-xs tracking-[0.3em] font-bold uppercase">Scheduling</span>
            </div>
            <h1 className="text-4xl text-white tracking-wide glow-text">Appointments</h1>
          </div>

          <button className="px-6 py-3 rounded-xl border border-neon-lime text-neon-lime hover:bg-neon-lime hover:text-black transition-all font-bold tracking-widest uppercase flex items-center gap-2 shadow-neon-lime">
            <Plus className="w-4 h-4" /> New Booking
          </button>
        </div>

        <div className="futuristic-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-20 h-20 rounded-full border-2 border-white/10 flex items-center justify-center mb-6 opacity-50">
            <Calendar className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-xl text-white tracking-widest mb-2">No Active Appointments</h3>
          <p className="text-neutral-500 text-sm max-w-sm leading-relaxed tracking-wider">
            Your schedule is currently clear. Any upcoming scans, check-ups, or follow-ups booked through the network will appear here.
          </p>
        </div>

      </div>
    </FuturisticPatientLayout>
  );
}
