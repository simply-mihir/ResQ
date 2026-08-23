'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';

export default function PatientLoginPage() {
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
      router.push('/dashboard'); // Patient dashboard
    } catch (err) {
      alert('Network error while verifying OTP');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badgeText="Patient Portal"
      badgeColorClass="text-neon-lime border-neon-lime/30"
      testimonialText="ResQ helped me get emergency assistance quickly and made the entire process feel simple when every second mattered."
      testimonialAuthor="Aarav Mehta"
      testimonialRole="Patient • New Delhi"
      imageSrc="/images/auth-patient.jpg"
      imageAlt="Ambulance arriving at a modern emergency department at night"
    >
      <div className="animate-fade-in">
        <h2 className="text-4xl text-white mb-3">Welcome Back</h2>
        <p className="text-[#888] text-[15px] mb-10 leading-relaxed">
          Access your ResQ emergency profile and stay connected to your care network.
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] text-white/60 tracking-wider uppercase font-semibold pl-1">
                Email or Phone
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or phone number"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-neon-lime/50 transition-all text-[15px]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-4 mt-4 bg-neon-lime hover:bg-[#A3CC00] text-[#030303] text-[16px] font-bold rounded-2xl transition-all shadow-neon-lime disabled:opacity-50"
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
                <button type="button" onClick={() => setStep(1)} className="text-[12px] text-neon-lime hover:text-white transition-colors">
                  Change Email/Phone
                </button>
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-neon-lime/50 transition-all text-[15px] tracking-[0.5em] text-center"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-4 mt-4 bg-neon-lime hover:bg-[#A3CC00] text-[#030303] text-[16px] font-bold rounded-2xl transition-all shadow-neon-lime disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-[#888] text-[14px]">
            Don't have an account?{' '}
            <Link href="/register" className="text-white hover:text-neon-lime transition-colors border-b border-white/20 pb-0.5">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
