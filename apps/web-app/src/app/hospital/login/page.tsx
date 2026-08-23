'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';

export default function HospitalLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }
      setLoading(false);
      setStep(2);
    } catch (err) {
      alert('Network error while sending OTP');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Invalid OTP');
        setLoading(false);
        return;
      }
      setLoading(false);
      router.push('/hospital'); // Hospital dashboard
    } catch (err) {
      alert('Network error while verifying OTP');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badgeText="Hospital Partner"
      badgeColorClass="text-blue-400 border-blue-400/30"
      testimonialText="Having a single platform for emergency coordination has made it much easier for our team to respond to incoming cases."
      testimonialAuthor="Dr. Emily Carter"
      testimonialRole="Emergency Department • Boston"
      imageSrc="/images/auth-hospital.jpg"
      imageAlt="Modern hospital emergency department command center"
    >
      <div className="animate-fade-in">
        <h2 className="text-4xl text-white mb-3">Hospital Command</h2>
        <p className="text-[#888] text-[15px] mb-10 leading-relaxed">
          Manage emergency cases, coordinate ambulances, and monitor hospital capacity.
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] text-white/60 tracking-wider uppercase font-semibold pl-1">
                Hospital Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hospital.com"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all text-[15px]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-500 text-white text-[16px] font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[13px] text-white/60 tracking-wider uppercase font-semibold">
                  Enter OTP
                </label>
                <button type="button" onClick={() => setStep(1)} className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                  Change Email
                </button>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all text-[15px] tracking-[0.5em] text-center"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-500 text-white text-[16px] font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-[#888] text-[14px]">
            Don't have an account?{' '}
            <Link href="/hospital/register" className="text-white hover:text-blue-400 transition-colors border-b border-white/20 pb-0.5">
              Register Hospital
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
