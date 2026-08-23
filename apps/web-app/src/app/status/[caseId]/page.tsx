'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { GlassBackground } from '@/components/layout/GlassBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassNavbar } from '@/components/ui/GlassNavbar';

// Dynamically import the live map to avoid SSR issues with Leaflet
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

// Default Mumbai coordinates as fallback
const MUMBAI_DEFAULT = { lat: 19.076, lng: 72.8777 };

// Generate a random start point ~2-3km from the target
function generateStartPoint(target: { lat: number; lng: number }) {
  // ~0.02 degrees latitude is roughly 2.2km
  const angle = Math.random() * 2 * Math.PI;
  const distance = 0.018 + Math.random() * 0.01; // 2-3km roughly
  return {
    lat: target.lat + distance * Math.sin(angle),
    lng: target.lng + distance * Math.cos(angle),
  };
}

// Linear interpolation with slight randomness for realistic movement
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

// Calculate distance between two points in km (Haversine)
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

interface CaseData {
  id: string;
  caseNumber: string;
  status: string;
  locationLat: number;
  locationLng: number;
  locationAddress?: string;
  severityTier?: string;
  etaMinutes?: number;
  familyToken?: string;
  createdAt: string;
  dispatchedAt?: string;
  arrivedAt?: string;
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
    currentLat?: number;
    currentLng?: number;
  };
  triggeredBy?: {
    name?: string;
  };
}

export default function StatusScreen({
  params,
}: {
  params: { caseId: string };
}) {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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
  const totalStepsRef = useRef(60); // ~2 minutes at 2s intervals
  const stepRef = useRef(0);

  // Emergency location: use case data location, fallback to user location, then Mumbai default
  const emergencyLocation = caseData
    ? { lat: caseData.locationLat, lng: caseData.locationLng }
    : userLocation || MUMBAI_DEFAULT;

  // Fetch case data
  useEffect(() => {
    async function fetchCase() {
      try {
        const res = await fetch(`/api/cases/${params.caseId}`);
        if (res.ok) {
          const data = await res.json();
          setCaseData(data);
        } else {
          // If API fails, continue with simulated data
          console.warn('Could not fetch case data, using simulation defaults');
        }
      } catch (err) {
        console.warn('API unavailable, using simulation defaults');
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [params.caseId]);

  // Get user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Geolocation failed, will use case data or Mumbai default
          setUserLocation(MUMBAI_DEFAULT);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      setUserLocation(MUMBAI_DEFAULT);
    }
  }, []);

  // Initialize ambulance simulation once we have a target location
  useEffect(() => {
    if (arrived || startPointRef.current) return;

    const target = caseData
      ? { lat: caseData.locationLat, lng: caseData.locationLng }
      : userLocation;

    if (!target) return;

    const start = generateStartPoint(target);
    startPointRef.current = start;
    setAmbulancePos(start);

    const totalDist = distanceKm(start, target);
    const estimatedMinutes = Math.max(2, Math.round(totalDist * 2.5));
    totalStepsRef.current = Math.round((estimatedMinutes * 60) / 2); // 2s intervals
    setEtaSeconds(estimatedMinutes * 60);
  }, [caseData, userLocation, arrived]);

  // Ambulance movement simulation
  useEffect(() => {
    if (!startPointRef.current || arrived) return;

    const target = caseData
      ? { lat: caseData.locationLat, lng: caseData.locationLng }
      : userLocation || MUMBAI_DEFAULT;

    const interval = setInterval(() => {
      stepRef.current += 1;
      const currentProgress = Math.min(
        stepRef.current / totalStepsRef.current,
        1
      );
      setProgress(currentProgress);

      // Ease-in-out for more realistic movement
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

      // Update ETA
      const remainingRatio = 1 - currentProgress;
      const remainingSeconds = Math.max(
        0,
        Math.round(remainingRatio * totalStepsRef.current * 2)
      );
      setEtaSeconds(remainingSeconds);

      // Check if arrived
      if (currentProgress >= 1) {
        setArrived(true);
        setAmbulancePos(target);
        setEtaSeconds(0);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [startPointRef.current, caseData, userLocation, arrived]);

  const vehicleNumber =
    caseData?.assignedAmbulance?.vehicleNumber || 'MH-01-AX-1234';
  const driverName = 'Ramesh K.';
  const caseNumber = caseData?.caseNumber || `HC-${params.caseId.slice(-6).toUpperCase()}`;
  const familyToken = caseData?.familyToken || `fam-${params.caseId.slice(0, 8)}`;

  const etaMinutes = Math.ceil(etaSeconds / 60);

  const handleShareFamily = useCallback(() => {
    const shareUrl = `${window.location.origin}/family/case/${familyToken}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [familyToken]);

  const hospitalLocation = caseData?.assignedHospital
    ? {
        lat: caseData.assignedHospital.locationLat,
        lng: caseData.assignedHospital.locationLng,
      }
    : undefined;

  // Timeline steps
  const timelineSteps = [
    {
      label: 'Emergency Triggered',
      detail: 'Location detected and emergency reported',
      status: 'completed' as const,
    },
    {
      label: 'Ambulance Dispatched',
      detail: `${vehicleNumber} assigned to your case`,
      status: 'completed' as const,
    },
    {
      label: 'En Route to Scene',
      detail: arrived
        ? 'Ambulance reached the scene'
        : `ETA: ${etaMinutes} min remaining`,
      status: arrived ? ('completed' as const) : ('active' as const),
      progress: arrived ? 100 : Math.round(progress * 100),
    },
    {
      label: 'Arrived at Scene',
      detail: arrived ? 'Medical team is with you' : 'Waiting for arrival',
      status: arrived ? ('completed' as const) : ('pending' as const),
    },
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-white selection:bg-neon-lime/30 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(204,255,0,0.05),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,240,255,0.03),transparent_50%)]" />
      </div>

      {/* Minimal Top Nav */}
      <div className="relative z-20 border-b border-white/10 bg-dark-surface/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neon-lime/10 border border-neon-lime/30 flex items-center justify-center shadow-neon-lime">
            <span className="text-neon-lime text-sm font-bold tracking-tighter glow-text">R</span>
          </div>
          <span className="font-bold tracking-widest uppercase">Live Telemetry</span>
        </div>
        <div className="text-xs text-neutral-400 tracking-[0.2em] uppercase font-mono">
          ID: {caseNumber}
        </div>
      </div>

      <main className="relative z-10 flex flex-col lg:flex-row h-[calc(100vh-65px)]">
        {/* Left Side: Map HUD */}
        <div className="flex-1 relative p-6 h-full flex flex-col">
          <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 shadow-glass-dark">
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
              <div className="h-full w-full bg-dark-surface animate-pulse flex items-center justify-center">
                <div className="text-neon-cyan tracking-widest text-sm font-mono uppercase">
                  Acquiring Sat-Link...
                </div>
              </div>
            )}

            {/* ETA overlay on the map */}
            <div className="absolute bottom-6 left-6 right-6 z-[1000] flex justify-center pointer-events-none">
              <div className="futuristic-card px-8 py-6 w-full max-w-2xl border-neon-cyan/30 pointer-events-auto">
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                  <h3 className="font-bold text-white text-xl tracking-widest uppercase">
                    {arrived ? (
                      <span className="text-neon-lime glow-text">Target Reached</span>
                    ) : (
                      <>T-MINUS: <span className="text-neon-cyan">{etaMinutes}m</span></>
                    )}
                  </h3>
                  <span
                    className={`font-bold text-xs tracking-widest uppercase px-3 py-1 rounded-sm border ${
                      arrived
                        ? 'text-neon-lime border-neon-lime/50 bg-neon-lime/10 shadow-neon-lime'
                        : 'text-neon-cyan border-neon-cyan/50 bg-neon-cyan/10 shadow-neon-cyan'
                    }`}
                  >
                    {arrived ? 'On Scene' : 'In Transit'}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center border ${arrived ? 'bg-neon-lime/10 border-neon-lime/30' : 'bg-neon-cyan/10 border-neon-cyan/30'}`}>
                    <svg className={`w-7 h-7 ${arrived ? 'text-neon-lime' : 'text-neon-cyan'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white tracking-widest uppercase mb-1">Driver: {driverName}</p>
                    <p className="text-sm text-neutral-400 font-mono">{vehicleNumber} • ALS Unit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Timeline & Details */}
        <div className="w-full lg:w-[450px] bg-dark-surface/80 border-l border-white/5 p-8 overflow-y-auto">
          
          <h4 className="text-neon-cyan text-xs font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" /> Operation Log
          </h4>
          
          <div className="space-y-6 mb-12">
            {timelineSteps.map((step, index) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full flex-shrink-0 border-2 ${
                      step.status === 'completed'
                        ? 'bg-neon-lime border-neon-lime shadow-neon-lime'
                        : step.status === 'active'
                          ? 'bg-neon-cyan/20 border-neon-cyan shadow-neon-cyan animate-neon-pulse'
                          : 'bg-dark-bg border-neutral-600'
                    }`}
                  />
                  {index < timelineSteps.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 my-2 min-h-[32px] ${
                        step.status === 'completed'
                          ? 'bg-neon-lime/50 shadow-neon-lime'
                          : 'bg-neutral-800'
                      }`}
                    />
                  )}
                </div>
                <div className="pb-6 flex-1 min-w-0">
                  <p
                    className={`font-bold text-sm tracking-widest uppercase ${
                      step.status === 'pending'
                        ? 'text-neutral-500'
                        : step.status === 'active'
                          ? 'text-neon-cyan glow-text'
                          : 'text-white'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1 font-mono tracking-wider">
                    {step.detail}
                  </p>
                  {step.status === 'active' && step.progress !== undefined && (
                    <div className="mt-4 w-full bg-neutral-800/50 rounded-full h-1 overflow-hidden border border-white/5">
                      <div
                        className="bg-neon-cyan h-full transition-all duration-1000 shadow-neon-cyan"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleShareFamily}
            className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase text-sm transition-all duration-300 border mb-8 ${
              copied
                ? 'bg-neon-lime/20 text-neon-lime border-neon-lime shadow-neon-lime'
                : 'bg-dark-bg text-neutral-300 border-white/20 hover:border-white/50 hover:bg-white/5'
            }`}
          >
            {copied ? 'Link Copied To Clipboard' : 'Share Tracking Link'}
          </button>

          {caseData?.assignedHospital && (
            <div className="futuristic-card p-6 border-neon-lime/10">
              <h4 className="text-xs font-bold text-neon-lime tracking-[0.2em] uppercase mb-4">Assigned Facility</h4>
              <p className="font-bold text-white tracking-widest mb-1">{caseData.assignedHospital.name}</p>
              {caseData.assignedHospital.address && (
                <p className="text-xs text-neutral-400 font-mono tracking-wider mb-4">
                  {caseData.assignedHospital.address}
                </p>
              )}
              {caseData.assignedHospital.phone && (
                <a
                  href={`tel:${caseData.assignedHospital.phone}`}
                  className="inline-block px-4 py-2 text-xs text-black bg-neon-lime font-bold tracking-widest uppercase rounded hover:bg-white transition-colors"
                >
                  Contact Facility
                </a>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
