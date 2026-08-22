'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import for Leaflet map to avoid SSR issues
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

interface AmbulanceTrackerProps {
  patientLocation: { lat: number; lng: number };
  ambulanceLocation?: { lat: number; lng: number };
  ambulanceVehicleNumber?: string;
  isResponderView?: boolean;
}

export default function AmbulanceTracker({
  patientLocation,
  ambulanceLocation,
  ambulanceVehicleNumber,
  isResponderView = false,
}: AmbulanceTrackerProps) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      // Fix leaflet marker icon issues in Next.js
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
      setL(leaflet);
    });
  }, []);

  if (!L) return <div className="h-full w-full bg-neutral-100 animate-pulse rounded-xl" />;

  const center: [number, number] = ambulanceLocation && isResponderView
    ? [ambulanceLocation.lat, ambulanceLocation.lng]
    : [patientLocation.lat, patientLocation.lng];

  // Custom icons
  const patientIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const ambulanceIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const polylinePositions: [number, number][] = [];
  if (ambulanceLocation) {
    polylinePositions.push([ambulanceLocation.lat, ambulanceLocation.lng]);
    polylinePositions.push([patientLocation.lat, patientLocation.lng]);
  }

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-glass-1">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={[patientLocation.lat, patientLocation.lng]} icon={patientIcon}>
          <Popup>
            <div className="font-semibold text-neutral-800">Emergency Location</div>
            <div className="text-xs text-neutral-500">Target destination</div>
          </Popup>
        </Marker>

        {ambulanceLocation && (
          <Marker position={[ambulanceLocation.lat, ambulanceLocation.lng]} icon={ambulanceIcon}>
            <Popup>
              <div className="font-semibold text-primary-700">Ambulance</div>
              <div className="text-xs text-neutral-500">{ambulanceVehicleNumber || 'Dispatched'}</div>
            </Popup>
          </Marker>
        )}

        {ambulanceLocation && (
          <Polyline 
            positions={polylinePositions} 
            color="#6366F1" 
            weight={4} 
            dashArray="10, 10" 
            opacity={0.6}
          />
        )}
      </MapContainer>
    </div>
  );
}
