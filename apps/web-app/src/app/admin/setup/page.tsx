'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';

export default function AdminSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/admin/login');
    }, 800);
  };

  return (
    <AuthLayout
      badgeText="Admin Access"
      badgeColorClass="text-purple-400 border-purple-400/30"
      testimonialText="ResQ gives our emergency network the visibility we need to coordinate hospitals, ambulances, and patients in real time."
      testimonialAuthor="Daniel Brooks"
      testimonialRole="Network Operations • Chicago"
      imageSrc="/images/auth-admin.jpg"
      imageAlt="Large modern hospital network operations center"
    >
      <div className="animate-fade-in">
        <h2 className="text-4xl text-white mb-3">System Setup</h2>
        <p className="text-[#888] text-[15px] mb-8 leading-relaxed">
          Initialize a new administrative node for the ResQ network. This action is logged.
        </p>

        <form onSubmit={handleSetup} className="space-y-5">
          
          <div className="space-y-2">
            <label className="text-[12px] text-white/60 tracking-wider uppercase font-semibold pl-1">
              Admin Name
            </label>
            <input
              type="text"
              placeholder="Admin Name"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all text-[14px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] text-white/60 tracking-wider uppercase font-semibold pl-1">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@resq.net"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all text-[14px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[12px] text-white/60 tracking-wider uppercase font-semibold pl-1">
              Authorization Key
            </label>
            <input
              type="text"
              placeholder="AUTH-XXXX-XXXX"
              className="w-full px-4 py-3 bg-purple-500/5 border border-purple-500/20 rounded-2xl text-purple-200 placeholder-purple-500/40 focus:outline-none focus:bg-purple-500/10 focus:border-purple-500/50 transition-all text-[14px] font-mono tracking-widest"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[12px] text-white/60 tracking-wider uppercase font-semibold pl-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all text-[14px] tracking-[0.2em]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[12px] text-white/60 tracking-wider uppercase font-semibold pl-1">
                Confirm
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all text-[14px] tracking-[0.2em]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 bg-purple-600 hover:bg-purple-500 text-white text-[16px] font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50"
          >
            {loading ? 'Provisioning...' : 'Initialize Node'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#888] text-[14px]">
            Already provisioned?{' '}
            <Link href="/admin/login" className="text-white hover:text-purple-400 transition-colors border-b border-white/20 pb-0.5">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
