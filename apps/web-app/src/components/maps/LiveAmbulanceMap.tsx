'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

interface LiveAmbulanceMapProps {
  patientLocation: { lat: number; lng: number };
  hospitalLocation?: { lat: number; lng: number };
  ambulancePosition: { lat: number; lng: number };
  vehicleNumber?: string;
  etaMinutes?: number;
  arrived?: boolean;
}

export default function LiveAmbulanceMap({
  patientLocation,
  hospitalLocation,
  ambulancePosition,
  vehicleNumber = 'MH-01-AX-1234',
  etaMinutes,
  arrived = false,
}: LiveAmbulanceMapProps) {
  const [L, setL] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      // Fix default marker icon path issue in Next.js / webpack
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl:
          'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
      setL(leaflet);
    });
  }, []);

  if (!L) {
    return (
      <div className="h-full w-full bg-neutral-900/50 animate-pulse rounded-xl flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading map...</div>
      </div>
    );
  }

  // Create custom marker icons
  const patientIcon = new L.Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const ambulanceIcon = new L.Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const hospitalIcon = new L.Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Calculate map center: midpoint between ambulance and patient
  const centerLat = (ambulancePosition.lat + patientLocation.lat) / 2;
  const centerLng = (ambulancePosition.lng + patientLocation.lng) / 2;

  // Build the dashed polyline from ambulance to patient
  const routePositions: [number, number][] = [
    [ambulancePosition.lat, ambulancePosition.lng],
    [patientLocation.lat, patientLocation.lng],
  ];

  // If hospital location exists, extend the route
  const hospitalRoutePositions: [number, number][] | null = hospitalLocation
    ? [
        [patientLocation.lat, patientLocation.lng],
        [hospitalLocation.lat, hospitalLocation.lng],
      ]
    : null;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(204,255,0,0.15)] border border-neon-lime/20 relative z-10">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={14}
        style={{ height: '100%', width: '100%', background: '#050505' }}
        zoomControl={false}
        key={`map-${patientLocation.lat}-${patientLocation.lng}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Patient / Emergency location marker */}
        <Marker
          position={[patientLocation.lat, patientLocation.lng]}
          icon={patientIcon}
        >
          <Popup className="futuristic-popup">
            <div className="font-bold text-emergency-500 tracking-wider">SOS ORIGIN</div>
            <div className="text-[10px] text-neutral-400 font-mono mt-1 uppercase">Target Acquired</div>
          </Popup>
        </Marker>

        {/* Ambulance marker */}
        <Marker
          position={[ambulancePosition.lat, ambulancePosition.lng]}
          icon={ambulanceIcon}
          key={`amb-${ambulancePosition.lat}-${ambulancePosition.lng}`}
        >
          <Popup className="futuristic-popup">
            <div className="font-bold text-neon-cyan tracking-wider">
              {arrived ? 'UNIT ON SCENE' : 'UNIT EN ROUTE'}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono mt-1 uppercase">{vehicleNumber}</div>
            {etaMinutes !== undefined && !arrived && (
              <div className="text-xs text-neon-lime font-bold mt-1 tracking-widest">
                T-MINUS: {etaMinutes}m
              </div>
            )}
          </Popup>
        </Marker>

        {/* Hospital marker if provided */}
        {hospitalLocation && (
          <Marker
            position={[hospitalLocation.lat, hospitalLocation.lng]}
            icon={hospitalIcon}
          >
            <Popup className="futuristic-popup">
              <div className="font-bold text-neon-lime tracking-wider">DESTINATION</div>
              <div className="text-[10px] text-neutral-400 font-mono mt-1 uppercase">
                Medical Facility
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dashed polyline from ambulance to patient */}
        {!arrived && (
          <Polyline
            positions={routePositions}
            color="#00F0FF"
            weight={3}
            dashArray="10, 15"
            opacity={0.8}
            className="animate-pulse"
          />
        )}

        {/* Dashed polyline from patient to hospital */}
        {hospitalRoutePositions && (
          <Polyline
            positions={hospitalRoutePositions}
            color="#CCFF00"
            weight={2}
            dashArray="5, 10"
            opacity={0.5}
          />
        )}
      </MapContainer>

      {/* Grid overlay for aesthetic */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-[400]" style={{ backgroundImage: 'linear-gradient(#00F0FF 1px, transparent 1px), linear-gradient(90deg, #00F0FF 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Ambulance arrived overlay */}
      {arrived && (
        <div className="absolute inset-0 bg-neon-lime/10 backdrop-blur-[2px] flex items-center justify-center z-[1000] pointer-events-none">
          <div className="bg-neon-lime text-black px-8 py-4 rounded-xl text-xl tracking-[0.2em] font-bold shadow-neon-lime-strong animate-pulse border border-white">
            MEDICAL UNIT ON SCENE
          </div>
        </div>
      )}
    </div>
  );
}
