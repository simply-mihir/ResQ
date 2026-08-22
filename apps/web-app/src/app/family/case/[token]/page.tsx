import { prisma } from '@/lib/prisma';
import AmbulanceTracker from '@/components/maps/AmbulanceTracker';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

export default async function FamilyTrackingPage({ params }: { params: { token: string } }) {
  const emergencyCase = await prisma.emergencyCase.findUnique({
    where: { familyToken: params.token },
    include: {
      assignedAmbulance: true,
      assignedHospital: true,
      statusHistory: {
        orderBy: { changedAt: 'desc' }
      }
    }
  });

  if (!emergencyCase) return notFound();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-50">
        <h1 className="font-bold text-lg text-neutral-800 text-center">Family Tracking View</h1>
        <p className="text-xs text-neutral-500 text-center mt-1">Case #{emergencyCase.caseNumber}</p>
      </header>

      <main className="flex-1 p-4 max-w-xl mx-auto w-full flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-glass-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-neutral-800">Live Status</h2>
            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
              {emergencyCase.status}
            </span>
          </div>

          <div className="h-[250px] w-full rounded-xl overflow-hidden relative mb-4">
            <AmbulanceTracker 
              patientLocation={{ lat: emergencyCase.locationLat, lng: emergencyCase.locationLng }}
              ambulanceLocation={
                emergencyCase.assignedAmbulance && emergencyCase.assignedAmbulance.currentLat
                ? { lat: emergencyCase.assignedAmbulance.currentLat, lng: emergencyCase.assignedAmbulance.currentLng }
                : undefined
              }
              ambulanceVehicleNumber={emergencyCase.assignedAmbulance?.vehicleNumber}
              isResponderView={false}
            />
          </div>
          
          {emergencyCase.assignedAmbulance && (
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Ambulance</p>
                <p className="font-medium text-neutral-800">{emergencyCase.assignedAmbulance.vehicleNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">ETA</p>
                <p className="font-medium text-emerald-600">{emergencyCase.etaMinutes} mins</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-glass-1">
          <h2 className="font-bold text-neutral-800 mb-4">Timeline</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
            {emergencyCase.statusHistory.map((history, i) => (
              <div key={history.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-white bg-primary-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-neutral-50 p-4 rounded-xl border border-neutral-100 shadow-sm ml-4 md:ml-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-neutral-800 text-sm">{history.toStatus.replace(/_/g, ' ')}</h3>
                    <time className="text-xs text-neutral-500">{format(history.changedAt, 'h:mm a')}</time>
                  </div>
                  {history.notes && <p className="text-xs text-neutral-600">{history.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
