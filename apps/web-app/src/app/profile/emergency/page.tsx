import { prisma } from '@/lib/prisma';
import { QRCodeSVG } from 'qrcode.react';

export default async function EmergencyProfilePage() {
  const profile = await prisma.emergencyProfile.findFirst({
    include: { user: true }
  });

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full">
          <p className="text-neutral-500 mb-4">No emergency profile found.</p>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-xl transition-colors w-full">
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  const scanUrl = `https://app.health.com/responder/scan/${profile.qrToken}`;

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2 text-center">Medical ID</h1>
        <p className="text-neutral-500 text-center mb-8">Scan QR code for emergency access</p>

        <div className="bg-white rounded-3xl shadow-glass-1 overflow-hidden">
          <div className="bg-primary-900 text-white p-8 flex flex-col items-center justify-center relative">
            <div className="bg-white p-4 rounded-2xl mb-4 shadow-lg">
              <QRCodeSVG value={scanUrl} size={180} level="H" />
            </div>
            <p className="text-sm text-white/80 uppercase tracking-widest font-medium">Emergency QR</p>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-neutral-800 mb-1">{profile.user?.name || 'Anonymous User'}</h2>
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                {profile.bloodGroup || 'Blood Type Unknown'}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Allergies</h3>
                {profile.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies.map(allergy => (
                      <span key={allergy} className="bg-orange-50 border border-orange-100 text-orange-700 px-3 py-1 rounded-lg text-sm">{allergy}</span>
                    ))}
                  </div>
                ) : <p className="text-neutral-700">None known</p>}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Chronic Conditions</h3>
                {profile.chronicConditions.length > 0 ? (
                  <ul className="list-disc list-inside text-neutral-700 space-y-1">
                    {profile.chronicConditions.map(cond => <li key={cond}>{cond}</li>)}
                  </ul>
                ) : <p className="text-neutral-700">None known</p>}
              </div>

              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 mt-6">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Emergency Contact</h3>
                <p className="font-medium text-neutral-800">{profile.emergencyContactName}</p>
                <p className="text-neutral-500 text-sm mt-1">{profile.emergencyContactPhone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
