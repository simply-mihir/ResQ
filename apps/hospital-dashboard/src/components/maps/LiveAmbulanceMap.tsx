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
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg relative">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        key={`map-${patientLocation.lat}-${patientLocation.lng}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Patient / Emergency location marker (red) */}
        <Marker
          position={[patientLocation.lat, patientLocation.lng]}
          icon={patientIcon}
        >
          <Popup>
            <div className="font-semibold text-red-700">Emergency Location</div>
            <div className="text-xs text-neutral-500">Patient location</div>
          </Popup>
        </Marker>

        {/* Ambulance marker (blue) - uses key to force re-render on position change */}
        <Marker
          position={[ambulancePosition.lat, ambulancePosition.lng]}
          icon={ambulanceIcon}
          key={`amb-${ambulancePosition.lat}-${ambulancePosition.lng}`}
        >
          <Popup>
            <div className="font-semibold text-blue-700">
              {arrived ? 'Ambulance Arrived' : 'Ambulance En Route'}
            </div>
            <div className="text-xs text-neutral-500">{vehicleNumber}</div>
            {etaMinutes !== undefined && !arrived && (
              <div className="text-xs text-blue-600 mt-1">
                ETA: {etaMinutes} min
              </div>
            )}
          </Popup>
        </Marker>

        {/* Hospital marker (green) if provided */}
        {hospitalLocation && (
          <Marker
            position={[hospitalLocation.lat, hospitalLocation.lng]}
            icon={hospitalIcon}
          >
            <Popup>
              <div className="font-semibold text-green-700">Hospital</div>
              <div className="text-xs text-neutral-500">
                Assigned destination
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dashed polyline from ambulance to patient */}
        {!arrived && (
          <Polyline
            positions={routePositions}
            color="#6366F1"
            weight={4}
            dashArray="10, 10"
            opacity={0.7}
          />
        )}

        {/* Dashed polyline from patient to hospital (different color) */}
        {hospitalRoutePositions && (
          <Polyline
            positions={hospitalRoutePositions}
            color="#10B981"
            weight={3}
            dashArray="8, 8"
            opacity={0.5}
          />
        )}
      </MapContainer>

      {/* Ambulance arrived overlay */}
      {arrived && (
        <div className="absolute inset-0 bg-green-900/20 flex items-center justify-center z-[1000] pointer-events-none">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg animate-pulse">
            Ambulance Has Arrived
          </div>
        </div>
      )}
    </div>
  );
}
