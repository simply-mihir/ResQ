'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';

import { IncomingAlertCard } from '@/components/ui/IncomingAlertCard';

type EmergencyCase = {
  id: string;
  caseNumber: string;
  status: string;
  severityTier: 'CRITICAL' | 'SERIOUS' | 'STABLE';
  triageData: any;
  createdAt: string;
  assignedHospitalId?: string | null;
  hospitalAlertedAt?: string | null;
  hospitalAcknowledgedAt?: string | null;
};

export default function DashboardPage() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectedCases, setRejectedCases] = useState<Set<string>>(new Set());

  const fetchCases = async () => {
    try {
      const data = await api.emergency.getActive();
      setCases(data);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    // Short-polling every 3 seconds
    const interval = setInterval(fetchCases, 3000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityBadge = (tier: string) => {
    switch (tier) {
      case 'CRITICAL':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold tracking-wide">CRITICAL</span>;
      case 'SERIOUS':
        return <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold tracking-wide">SERIOUS</span>;
      default:
        return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold tracking-wide">STABLE</span>;
    }
  };

  const formatTriage = (data: any) => {
    if (!data) return 'No data';
    const issues = [];
    if (data.conscious === false) issues.push('Unconscious');
    if (data.breathing === false) issues.push('Not breathing');
    if (data.bleeding) issues.push('Severe bleeding');
    
    if (issues.length === 0) return 'Stable Vitals';
    return issues.join(', ');
  };

  // Find incoming cases (status === TRIAGE_COMPLETE and not yet rejected locally)
  const incomingCases = cases.filter(c => c.status === 'TRIAGE_COMPLETE' && !c.hospitalAcknowledgedAt && !rejectedCases.has(c.id));

  return (
    <DashboardLayout>
      {incomingCases.map(incoming => (
        <IncomingAlertCard 
           key={incoming.id}
           emergency={incoming} 
           hospitalId={incoming.assignedHospitalId || 'test-hospital-id'} 
           onAccept={(id: string) => {
             // In real app, refetching will update the status to HOSPITAL_ACCEPTED
             fetchCases();
           }}
           onReject={() => {
             setRejectedCases(prev => new Set(prev).add(incoming.id));
           }}
        />
      ))}

      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Incoming Emergencies</h1>
          <p className="text-slate-400 text-sm">Real-time triage data from the field.</p>
        </div>
        <div className="text-sm text-slate-400">
          Total Active: <span className="font-bold text-white">{cases.length}</span>
        </div>
      </div>

      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/80 text-slate-300 text-sm border-b border-slate-700/50">
              <th className="p-4 font-semibold">Case ID</th>
              <th className="p-4 font-semibold">Time</th>
              <th className="p-4 font-semibold">Severity</th>
              <th className="p-4 font-semibold">Triage Report</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {loading && cases.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">Loading active cases...</td>
              </tr>
            ) : cases.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                    <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-slate-400">No active emergencies at this time.</p>
                </td>
              </tr>
            ) : (
              cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-700/20 transition-colors group">
                  <td className="p-4 font-mono text-sm text-slate-300">{c.caseNumber}</td>
                  <td className="p-4 text-sm text-slate-400">
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">{getSeverityBadge(c.severityTier)}</td>
                  <td className="p-4 text-sm text-slate-300 max-w-[200px] truncate">
                    {formatTriage(c.triageData)}
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all opacity-0 group-hover:opacity-100">
                      Dispatch
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
