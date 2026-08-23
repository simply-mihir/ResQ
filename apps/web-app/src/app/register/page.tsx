'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';

export default function PatientRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
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
      alert('Network error while registering');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-register', {
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
      router.push('/login');
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
        <h2 className="text-4xl text-white mb-3">Create Patient Account</h2>
        <p className="text-[#888] text-[15px] mb-10 leading-relaxed">
          Join the ResQ emergency network and ensure rapid response when you need it most.
        </p>

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[12px] text-white/60 tracking-wider uppercase font-semibold pl-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-neon-lime/50 transition-all text-[14px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] text-white/60 tracking-wider uppercase font-semibold pl-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-neon-lime/50 transition-all text-[14px]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[12px] text-white/60 tracking-wider uppercase font-semibold pl-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-neon-lime/50 transition-all text-[14px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] text-white/60 tracking-wider uppercase font-semibold pl-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-neon-lime/50 transition-all text-[14px]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 bg-neon-lime hover:bg-[#A3CC00] text-[#030303] text-[16px] font-bold rounded-2xl transition-all shadow-neon-lime disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[13px] text-white/60 tracking-wider uppercase font-semibold">
                  Enter OTP
                </label>
                <button type="button" onClick={() => setStep(1)} className="text-[12px] text-neon-lime hover:text-white transition-colors">
                  Change Details
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
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-[#888] text-[14px]">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:text-neon-lime transition-colors border-b border-white/20 pb-0.5">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
