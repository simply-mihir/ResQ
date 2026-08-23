'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassBackground } from '@/components/layout/GlassBackground';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { api } from '@/lib/api';

export default function ScanQrPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setScanning(true);

    if (!navigator.geolocation) {
      alert("Geolocation required to log scan");
      setScanning(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // 1. Log the scan via the emergency-service API
          await api.responder.logQrScan(token, {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });

          // 2. Navigate to the responder view
          router.push(`/responder/scan/${token}`);
        } catch (error) {
          console.error(error);
          alert("Invalid QR Token or Network Error");
          setScanning(false);
        }
      },
      (error) => {
        alert("Please enable location services to scan QR codes.");
        setScanning(false);
      }
    );
  };

  return (
    <GlassBackground variant="default">
      <GlassNavbar variant="transparent" backUrl="/">
        <span className="font-semibold text-neutral-800">Scan QR Code</span>
      </GlassNavbar>

      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="bg-white/40 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-xl max-w-sm w-full">
          <h1 className="text-xl font-bold text-neutral-800 mb-2 text-center">Simulated Scanner</h1>
          <p className="text-sm text-neutral-600 mb-6 text-center">
            For this MVP demo, manually enter the patient's QR Token below.
          </p>

          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Patient QR Token
              </label>
              <input 
                type="text" 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. 123e4567-e89b-12d3..."
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={scanning}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50"
            >
              {scanning ? 'Logging Scan & Loading Profile...' : 'Simulate Scan'}
            </button>
          </form>
        </div>
      </main>
    </GlassBackground>
  );
}
