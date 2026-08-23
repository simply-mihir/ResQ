'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  AlertTriangle, 
  User, 
  Calendar, 
  Bell, 
  Settings,
  LogOut
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <Activity className="w-5 h-5" /> },
  { name: 'Emergency', href: '/sos', icon: <AlertTriangle className="w-5 h-5" /> },
  { name: 'Medical Profile', href: '/profile/emergency', icon: <User className="w-5 h-5" /> },
  { name: 'Appointments', href: '/appointments', icon: <Calendar className="w-5 h-5" /> },
  { name: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
];

export default function FuturisticPatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-dark-bg text-neutral-100 flex overflow-hidden font-sans selection:bg-neon-lime/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(204,255,0,0.05),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,240,255,0.03),transparent_50%)]" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-dark-surface/50 backdrop-blur-xl flex flex-col relative z-20">
        
        {/* Brand */}
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-neon-lime/10 border border-neon-lime/30 flex items-center justify-center shadow-neon-lime">
            <span className="text-neon-lime text-xl font-bold tracking-tighter glow-text">R</span>
          </div>
          <span className="text-xl tracking-widest text-white">RESQ</span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-4 px-4">Patient Portal</div>
          
          {sidebarItems.map((item) => {
            const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative group cursor-pointer ${
                  isActive ? 'bg-neon-lime/10 text-neon-lime' : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-lime rounded-r-full shadow-neon-lime" />
                  )}
                  <div className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </div>
                  <span className="font-semibold tracking-wide text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <Link href="/settings">
            <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer text-neutral-400 hover:text-white hover:bg-white/5 ${
              pathname.startsWith('/settings') ? 'bg-white/10 text-white' : ''
            }`}>
              <Settings className="w-5 h-5" />
              <span className="font-semibold tracking-wide text-sm">Settings</span>
            </div>
          </Link>
          <div 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer text-neutral-500 hover:text-emergency-500 hover:bg-emergency-500/10"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold tracking-wide text-sm">Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 overflow-y-auto">
        <div className="p-8 md:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
