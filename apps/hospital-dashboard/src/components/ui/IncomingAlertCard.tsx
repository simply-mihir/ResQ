'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function IncomingAlertCard({ emergency, hospitalId, onAccept, onReject }: any) {
  const [timeLeft, setTimeLeft] = useState(45);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alertedAt = emergency.hospitalAlertedAt ? new Date(emergency.hospitalAlertedAt).getTime() : Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - alertedAt) / 1000);
      const remaining = Math.max(0, 45 - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onReject(); // auto reject visually
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [emergency, onReject]);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await api.dispatch.acceptCase(emergency.id, hospitalId);
      onAccept(emergency.id);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 border-2 border-red-500/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(239,68,68,0.2)] mb-6 animate-pulse-slow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center animate-bounce">
            <span className="text-2xl">🚨</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Incoming Emergency Route</h2>
            <p className="text-red-400 text-sm font-medium">Case #{emergency.caseNumber}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-3xl font-black text-red-500 tabular-nums">00:{timeLeft.toString().padStart(2, '0')}</span>
          <span className="text-[10px] uppercase font-bold text-red-500/80 tracking-wider">Auto-Reassigns in</span>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Severity</span>
          <span className="font-semibold text-red-400">{emergency.severityTier}</span>
        </div>
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Triage Report</span>
          <span className="text-slate-300 text-sm">
            {emergency.triageData ? (
               Object.keys(emergency.triageData).filter(k => emergency.triageData[k]).join(', ') || 'Stable'
            ) : 'No data'}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={onReject}
          disabled={loading}
          className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
        >
          Reject (Route to Next)
        </button>
        <button 
          onClick={handleAccept}
          disabled={loading}
          className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-colors"
        >
          {loading ? 'Accepting...' : 'ACCEPT EMERGENCY'}
        </button>
      </div>
    </div>
  );
}
