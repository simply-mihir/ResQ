'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/admin');
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
        <h2 className="text-4xl text-white mb-3">System Access</h2>
        <p className="text-[#888] text-[15px] mb-10 leading-relaxed">
          Access ResQ network operations, analytics, and administrative controls.
        </p>

        <form onSubmit={handleSignIn} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-[13px] text-white/60 tracking-wider uppercase font-semibold pl-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@resq.net"
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all text-[15px]"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[13px] text-white/60 tracking-wider uppercase font-semibold">
                Password
              </label>
              <Link href="#" className="text-[12px] text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all text-[15px] tracking-[0.2em]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-8 bg-purple-600 hover:bg-purple-500 text-white text-[16px] font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[#888] text-[14px]">
            Need configuration?{' '}
            <Link href="/admin/setup" className="text-white hover:text-purple-400 transition-colors border-b border-white/20 pb-0.5">
              Admin Setup
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
