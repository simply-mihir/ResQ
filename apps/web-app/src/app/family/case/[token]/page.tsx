'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { GlassBackground } from '@/components/layout/GlassBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassNavbar } from '@/components/ui/GlassNavbar';

// Dynamically import map component to avoid SSR issues
const LiveAmbulanceMap = dynamic(
  () => import('@/components/maps/LiveAmbulanceMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-neutral-900/30 animate-pulse rounded-xl flex items-center justify-center">
        <div className="text-neutral-500 text-sm">Loading map...</div>
      </div>
    ),
  }
);

// Default Mumbai coordinates
const MUMBAI_DEFAULT = { lat: 19.076, lng: 72.8777 };

function generateStartPoint(target: { lat: number; lng: number }) {
  const angle = Math.random() * 2 * Math.PI;
  const distance = 0.018 + Math.random() * 0.01;
  return {
    lat: target.lat + distance * Math.sin(angle),
    lng: target.lng + distance * Math.cos(angle),
  };
}

function interpolatePosition(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  progress: number
) {
  const jitter = () => (Math.random() - 0.5) * 0.0003;
  return {
    lat: start.lat + (end.lat - start.lat) * progress + jitter(),
    lng: start.lng + (end.lng - start.lng) * progress + jitter(),
  };
}

function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const hav =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
}

interface FamilyCaseData {
  id: string;
  caseNumber: string;
  status: string;
  locationLat: number;
  locationLng: number;
  locationAddress?: string;
  severityTier?: string;
  etaMinutes?: number;
  createdAt: string;
  dispatchedAt?: string;
  arrivedAt?: string;
  patientName?: string;
  assignedHospital?: {
    name: string;
    locationLat: number;
    locationLng: number;
    address?: string;
    phone?: string;
  };
  assignedAmbulance?: {
    vehicleNumber: string;
    status: string;
  };
}

export default function FamilyTrackingScreen({
  params,
}: {
  params: { token: string };
}) {
  const [caseData, setCaseData] = useState<FamilyCaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulation state
  const [ambulancePos, setAmbulancePos] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [copied, setCopied] = useState(false);

  const startPointRef = useRef<{ lat: number; lng: number } | null>(null);
  const totalStepsRef = useRef(60);
  const stepRef = useRef(0);

  // Emergency location from case data or default
  const emergencyLocation = caseData
    ? { lat: caseData.locationLat, lng: caseData.locationLng }
    : MUMBAI_DEFAULT;

  // Fetch case data by family token
  useEffect(() => {
    async function fetchCase() {
      try {
        const res = await fetch(`/api/cases/family/${params.token}`);
        if (res.ok) {
          const data = await res.json();
          setCaseData(data);
        } else if (res.status === 410) {
          setError('This tracking link has expired.');
        } else if (res.status === 404) {
          setError('Case not found. The link may be invalid.');
        } else {
          // Fallback to simulation with default data
          console.warn('Could not fetch case, using simulation defaults');
        }
      } catch (err) {
        console.warn('API unavailable, using simulation defaults');
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [params.token]);

  // Initialize ambulance simulation
  useEffect(() => {
    if (arrived || startPointRef.current) return;

    // Wait for case data or use default after loading
    if (loading) return;

    const target = caseData
      ? { lat: caseData.locationLat, lng: caseData.locationLng }
      : MUMBAI_DEFAULT;

    const start = generateStartPoint(target);
    startPointRef.current = start;
    setAmbulancePos(start);

    const totalDist = distanceKm(start, target);
    const estimatedMinutes = Math.max(2, Math.round(totalDist * 2.5));
    totalStepsRef.current = Math.round((estimatedMinutes * 60) / 2);
    setEtaSeconds(estimatedMinutes * 60);
  }, [caseData, loading, arrived]);

  // Ambulance movement interval
  useEffect(() => {
    if (!startPointRef.current || arrived) return;

    const target = caseData
      ? { lat: caseData.locationLat, lng: caseData.locationLng }
      : MUMBAI_DEFAULT;

    const interval = setInterval(() => {
      stepRef.current += 1;
      const currentProgress = Math.min(
        stepRef.current / totalStepsRef.current,
        1
      );
      setProgress(currentProgress);

      const easedProgress =
        currentProgress < 0.5
          ? 2 * currentProgress * currentProgress
          : 1 - Math.pow(-2 * currentProgress + 2, 2) / 2;

      const newPos = interpolatePosition(
        startPointRef.current!,
        target,
        easedProgress
      );
      setAmbulancePos(newPos);

      const remainingRatio = 1 - currentProgress;
      const remainingSeconds = Math.max(
        0,
        Math.round(remainingRatio * totalStepsRef.current * 2)
      );
      setEtaSeconds(remainingSeconds);

      if (currentProgress >= 1) {
        setArrived(true);
        setAmbulancePos(target);
        setEtaSeconds(0);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [startPointRef.current, caseData, arrived]);

  const vehicleNumber =
    caseData?.assignedAmbulance?.vehicleNumber || 'MH-01-AX-1234';
  const patientName = caseData?.patientName || 'Patient';
  const caseNumber = caseData?.caseNumber || `HC-${params.token.slice(-6).toUpperCase()}`;
  const etaMinutes = Math.ceil(etaSeconds / 60);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, []);

  const hospitalLocation = caseData?.assignedHospital
    ? {
        lat: caseData.assignedHospital.locationLat,
        lng: caseData.assignedHospital.locationLng,
      }
    : undefined;

  // Error state
  if (error) {
    return (
      <GlassBackground variant="calm">
        <GlassNavbar variant="transparent">
          <span className="font-semibold text-neutral-800">
            Family Tracker
          </span>
        </GlassNavbar>
        <main className="flex items-center justify-center min-h-screen px-4">
          <GlassCard level={2} padding="lg" className="max-w-md text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-bold text-neutral-800 mb-2">
              Unable to Load
            </h2>
            <p className="text-neutral-600 text-sm">{error}</p>
          </GlassCard>
        </main>
      </GlassBackground>
    );
  }

  // Timeline steps
  const timelineSteps = [
    {
      label: 'Emergency Triggered',
      detail: 'Emergency was reported',
      status: 'completed' as const,
    },
    {
      label: 'Ambulance Dispatched',
      detail: `Vehicle ${vehicleNumber} assigned`,
      status: 'completed' as const,
    },
    {
      label: 'En Route to Scene',
      detail: arrived
        ? 'Ambulance has arrived'
        : `Estimated ${etaMinutes} min remaining`,
      status: arrived ? ('completed' as const) : ('active' as const),
      progress: arrived ? 100 : Math.round(progress * 100),
    },
    {
      label: 'Arrived at Scene',
      detail: arrived ? 'Medical team on site' : 'Pending',
      status: arrived ? ('completed' as const) : ('pending' as const),
    },
  ];

  return (
    <GlassBackground variant="calm">
      <GlassNavbar variant="transparent">
        <span className="font-semibold text-neutral-800">Family Tracker</span>
      </GlassNavbar>

      <main className="flex flex-col min-h-screen pt-14">
        {/* Patient info header */}
        <div className="px-4 py-3 bg-white/60 backdrop-blur-sm border-b border-white/30">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-neutral-900">
                {patientName}
              </h1>
              <p className="text-xs text-neutral-500">
                Case #{caseNumber}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                arrived
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {arrived ? 'Arrived' : 'En Route'}
            </span>
          </div>
        </div>

        {/* Map section - 55vh */}
        <div className="relative" style={{ height: '55vh' }}>
          {ambulancePos ? (
            <LiveAmbulanceMap
              patientLocation={emergencyLocation}
              hospitalLocation={hospitalLocation}
              ambulancePosition={ambulancePos}
              vehicleNumber={vehicleNumber}
              etaMinutes={etaMinutes}
              arrived={arrived}
            />
          ) : (
            <div className="h-full w-full bg-neutral-100 animate-pulse flex items-center justify-center">
              <div className="text-neutral-500 text-sm">Loading map...</div>
            </div>
          )}

          {/* ETA overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
            <GlassCard
              level={3}
              padding="sm"
              className="backdrop-blur-xl bg-white/90"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                    🚑
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 text-sm">
                      {arrived ? (
                        <span className="text-green-600">
                          Ambulance Arrived
                        </span>
                      ) : (
                        <>ETA: {etaMinutes} min</>
                      )}
                    </p>
                    <p className="text-xs text-neutral-500">{vehicleNumber}</p>
                  </div>
                </div>
                {!arrived && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 tabular-nums">
                      {etaMinutes}
                    </div>
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      min
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Bottom panel */}
        <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] p-6 flex-1 z-20 -mt-4">
          {/* Timeline */}
          <h4 className="font-semibold text-neutral-800 mb-4">
            Case Timeline
          </h4>
          <div className="space-y-1 mb-6">
            {timelineSteps.map((step, index) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      step.status === 'completed'
                        ? 'bg-green-500'
                        : step.status === 'active'
                          ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse'
                          : 'bg-neutral-300'
                    }`}
                  />
                  {index < timelineSteps.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 my-1 min-h-[24px] ${
                        step.status === 'completed'
                          ? 'bg-green-200'
                          : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </div>
                <div className="pb-4 flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm ${
                      step.status === 'pending'
                        ? 'text-neutral-400'
                        : step.status === 'active'
                          ? 'text-blue-700'
                          : 'text-neutral-800'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {step.detail}
                  </p>
                  {step.status === 'active' && step.progress !== undefined && (
                    <div className="mt-2 w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Ambulance info card */}
          <GlassCard level={1} padding="md" className="mb-4">
            <h4 className="font-semibold text-neutral-800 mb-3 text-sm">
              Ambulance Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-neutral-500 text-xs">Vehicle</span>
                <p className="font-medium text-neutral-800">{vehicleNumber}</p>
              </div>
              <div>
                <span className="text-neutral-500 text-xs">Type</span>
                <p className="font-medium text-neutral-800">ALS Unit</p>
              </div>
              <div>
                <span className="text-neutral-500 text-xs">Status</span>
                <p
                  className={`font-medium ${arrived ? 'text-green-600' : 'text-blue-600'}`}
                >
                  {arrived ? 'On Scene' : 'En Route'}
                </p>
              </div>
              {caseData?.assignedHospital && (
                <div>
                  <span className="text-neutral-500 text-xs">Hospital</span>
                  <p className="font-medium text-neutral-800 truncate">
                    {caseData.assignedHospital.name}
                  </p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyLink}
              className={`py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? 'Copied!' : 'Copy Share Link'}
            </button>
            {caseData?.assignedHospital?.phone ? (
              <a
                href={`tel:${caseData.assignedHospital.phone}`}
                className="py-3 rounded-2xl font-semibold text-sm text-center bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 transition-colors"
              >
                Contact Hospital
              </a>
            ) : (
              <button
                onClick={() => alert('Hospital contact information unavailable')}
                className="py-3 rounded-2xl font-semibold text-sm bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 transition-colors"
              >
                Contact Hospital
              </button>
            )}
          </div>
        </div>
      </main>
    </GlassBackground>
  );
}
