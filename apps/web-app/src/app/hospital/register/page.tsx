'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';

export default function HospitalRegisterPage() {
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
      const res = await fetch('/api/auth/register-hospital', {
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
      const res = await fetch('/api/auth/verify-register-hospital', {
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
      router.push('/hospital/login');
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
        <h2 className="text-4xl text-white mb-3">Register Hospital</h2>
        <p className="text-[#888] text-[14px] mb-8 leading-relaxed">
          Join the ResQ network to integrate your emergency department and receive real-time ambulance routing.
        </p>

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-white/60 tracking-wider uppercase font-semibold pl-1">
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="General Hospital"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all text-[14px]"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-white/60 tracking-wider uppercase font-semibold pl-1">
                  Hospital Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hospital.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all text-[14px]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-white/60 tracking-wider uppercase font-semibold pl-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (800) 000-0000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all text-[14px]"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-white/60 tracking-wider uppercase font-semibold pl-1">
                  License / Registration ID
                </label>
                <input
                  type="text"
                  placeholder="LIC-00000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all text-[14px]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-white/60 tracking-wider uppercase font-semibold pl-1">
                Full Address
              </label>
              <input
                type="text"
                placeholder="123 Emergency Way, City, ST"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all text-[14px]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 bg-blue-600 hover:bg-blue-500 text-white text-[16px] font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[13px] text-white/60 tracking-wider uppercase font-semibold">
                  Enter OTP
                </label>
                <button type="button" onClick={() => setStep(1)} className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">
                  Change Details
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
              {loading ? 'Verifying...' : 'Verify & Create Hospital'}
            </button>
          </form>
        )}


        <div className="mt-6 text-center">
          <p className="text-[#888] text-[14px]">
            Already registered?{' '}
            <Link href="/hospital/login" className="text-white hover:text-blue-400 transition-colors border-b border-white/20 pb-0.5">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
