export const dynamic = "force-dynamic";

import { prisma } from '@/lib/prisma';
import AmbulanceTracker from '@/components/maps/AmbulanceTracker';
import { notFound } from 'next/navigation';

export default async function ResponderPage({ params }: { params: { ambulanceId: string } }) {
  const ambulance = await prisma.ambulance.findUnique({
    where: { id: params.ambulanceId },
  });

  if (!ambulance) return notFound();

  // Find active dispatched case
  const activeCase = await prisma.emergencyCase.findFirst({
    where: { 
      assignedAmbulanceId: params.ambulanceId,
      status: { in: ['DISPATCHED', 'EN_ROUTE_TO_PATIENT', 'EN_ROUTE_TO_HOSPITAL', 'AT_PATIENT'] }
    },
  });

  return (
    <div className="p-4 flex flex-col gap-4 h-[calc(100vh-64px)]">
      <div className="bg-white rounded-2xl p-4 shadow-glass-1">
        <h2 className="text-xl font-bold text-neutral-800 mb-1">Vehicle {ambulance.vehicleNumber}</h2>
        <p className="text-sm text-neutral-500">Status: <span className="text-emerald-500 font-semibold">{ambulance.status}</span></p>
      </div>

      {!activeCase ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-glass-1 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">Standing By</h3>
          <p className="text-neutral-500 text-sm">Waiting for incoming emergency dispatches...</p>
        </div>
      ) : (
        <>
          <div className="flex-1 rounded-2xl overflow-hidden relative min-h-[300px]">
            <AmbulanceTracker 
              patientLocation={{ lat: activeCase.locationLat, lng: activeCase.locationLng }}
              ambulanceLocation={{ lat: ambulance.currentLat, lng: ambulance.currentLng }}
              ambulanceVehicleNumber={ambulance.vehicleNumber}
              isResponderView={true}
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-glass-1 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-red-600 text-lg mb-1">EMERGENCY DISPATCH</h3>
              <div className="text-sm text-neutral-600 flex justify-between">
                <span>Case: {activeCase.caseNumber}</span>
                <span className="font-semibold">{activeCase.severityTier}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Target</p>
                <p className="font-medium text-neutral-800">
                  {activeCase.locationLat.toFixed(4)}, {activeCase.locationLng.toFixed(4)}
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Est. Travel</p>
                <p className="font-medium text-neutral-800">{activeCase.etaMinutes} minutes</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-colors">
                Accept Case
              </button>
              <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-colors">
                Arrived at Scene
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
