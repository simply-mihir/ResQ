import { prisma } from '@/lib/prisma';
import { GlassBackground } from '@/components/layout/GlassBackground';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { QRCodeSVG } from 'qrcode.react';

export const dynamic = "force-dynamic";

export default async function MyQrPage() {
  // Prevent build crash during Next.js static prerendering if DB isn't available
  if (!process.env.DATABASE_URL) {
    return (
      <GlassBackground variant="default">
        <div className="flex items-center justify-center min-h-screen text-neutral-600">
          Loading Emergency Profile... (or Database URL missing)
        </div>
      </GlassBackground>
    );
  }

  // Fetch user (MVP: assuming single seeded patient)
  let user;
  try {
    user = await prisma.user.findFirst({
      include: {
        emergencyProfile: true
      }
    });
  } catch (error) {
    console.warn("Prisma failed to connect during build/render:", error);
  }

  const profile = user?.emergencyProfile;

  return (
    <GlassBackground variant="default">
      <GlassNavbar variant="transparent" backUrl="/">
        <span className="font-semibold text-neutral-800">My Emergency QR</span>
      </GlassNavbar>

      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="bg-white/40 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-xl flex flex-col items-center text-center max-w-sm w-full">
          <h1 className="text-xl font-bold text-neutral-800 mb-2">Emergency Medical ID</h1>
          <p className="text-sm text-neutral-600 mb-8">
            First responders can scan this code to access your critical medical history and contact information instantly.
          </p>

          <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
            {profile?.qrToken ? (
              <QRCodeSVG 
                value={profile.qrToken} 
                size={200}
                level="Q"
                includeMargin={false}
              />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 rounded-xl">
                <span className="text-gray-400 text-sm">QR Token Not Found</span>
              </div>
            )}
          </div>

          <div className="w-full space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/20">
              <span className="text-sm text-neutral-500">Blood Group</span>
              <span className="font-medium text-red-600">{profile?.bloodGroup || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/20">
              <span className="text-sm text-neutral-500">Allergies</span>
              <span className="font-medium text-neutral-800">
                {profile?.allergies.length ? profile.allergies.join(', ') : 'None'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </GlassBackground>
  );
}
