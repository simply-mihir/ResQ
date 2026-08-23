'use client';

import React from 'react';
import FuturisticPatientLayout from '@/components/layout/FuturisticPatientLayout';
import { Bell, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <FuturisticPatientLayout>
      <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-4 h-4 text-neon-cyan" />
              <span className="text-neon-cyan text-xs tracking-[0.3em] font-bold uppercase">Alerts</span>
            </div>
            <h1 className="text-4xl text-white tracking-wide glow-text">Notifications</h1>
          </div>

          <button className="px-6 py-3 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-all font-bold tracking-widest uppercase flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Mark All Read
          </button>
        </div>

        <div className="futuristic-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-20 h-20 rounded-full border-2 border-white/10 flex items-center justify-center mb-6 opacity-50">
            <Bell className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-xl text-white tracking-widest mb-2">System Clear</h3>
          <p className="text-neutral-500 text-sm max-w-sm leading-relaxed tracking-wider">
            You have no pending alerts. All emergency network updates, hospital notifications, and system broadcast messages will be securely transmitted here.
          </p>
        </div>

      </div>
    </FuturisticPatientLayout>
  );
}
