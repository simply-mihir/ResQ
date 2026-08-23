'use client';

import { useEffect, useState } from 'react';
import { GlassBackground } from '@/components/layout/GlassBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { SimulatedBadge } from '@/components/ui/SimulatedBadge';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function HospitalMatchingScreen({ params }: { params: { caseId: string } }) {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const data = await api.hospitals.match(params.caseId);
        // Only show top 3 recommendations
        setMatches(data.recommendedHospitals?.slice(0, 3) || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, [params.caseId]);

  return (
    <GlassBackground variant="calm">
      <GlassNavbar variant="transparent">
        <span className="font-semibold text-neutral-800">Hospital Routing</span>
      </GlassNavbar>

      <main className="max-w-md mx-auto px-4 pt-20 pb-24 min-h-screen flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Finding Best Hospital</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Analyzing severity, traffic, and specialist availability.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
             <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
             <p className="mt-4 font-medium text-neutral-500">Calculating best matches...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {matches.map((hospital, idx) => (
              <GlassCard key={hospital.hospitalId} level={2} padding="md" className="relative overflow-hidden">
                 {idx === 0 && (
                    <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm">
                       Best Match
                    </div>
                 )}
                 <div className="flex justify-between items-start mb-4">
                    <div className="pr-16">
                       <h3 className="text-lg font-bold text-neutral-800">{hospital.name}</h3>
                       <p className="text-sm text-neutral-500 flex items-center gap-1">
                          {hospital.distanceKm} km away • ETA: {hospital.etaMin} mins
                       </p>
                    </div>
                    <div className="flex flex-col items-end text-right">
                       <div className="text-xl font-black text-primary-600">{hospital.totalScore}</div>
                       <div className="text-[10px] uppercase font-bold text-neutral-400">Match Score</div>
                    </div>
                 </div>

                 <div className="bg-neutral-50/80 rounded-xl p-3 border border-neutral-100">
                    <h4 className="text-xs font-bold text-neutral-500 uppercase mb-2">Score Breakdown <SimulatedBadge /></h4>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                       <div className="flex justify-between">
                          <span className="text-neutral-600">Travel Time</span>
                          <span className="font-semibold text-neutral-800">+{hospital.breakdown.travelTime}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-neutral-600">Beds ({hospital.bedCapacityFree})</span>
                          <span className="font-semibold text-neutral-800">+{hospital.breakdown.bedCapacity}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-neutral-600">Specialist</span>
                          <span className={`font-semibold ${hospital.specialistAvailable ? 'text-green-600' : 'text-neutral-400'}`}>
                             +{hospital.breakdown.specialistMatch}
                          </span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-neutral-600">Rating ({hospital.rating}⭐)</span>
                          <span className="font-semibold text-neutral-800">+{hospital.breakdown.rating}</span>
                       </div>
                       {hospital.breakdown.traumaBonus > 0 && (
                          <div className="flex justify-between col-span-2 bg-red-50 text-red-700 px-2 py-1 rounded-md mt-1">
                             <span>Trauma Center Bonus</span>
                             <span className="font-bold">+{hospital.breakdown.traumaBonus}</span>
                          </div>
                       )}
                    </div>
                 </div>
                 
                 {idx === 0 && (
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                       <button onClick={() => router.push(`/status/${params.caseId}`)} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md">
                          Continue to Live Status
                       </button>
                    </div>
                 )}
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </GlassBackground>
  );
}
