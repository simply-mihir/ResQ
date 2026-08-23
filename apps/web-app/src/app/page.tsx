'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function MasterLandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* 
        ========================================================================
        HERO SECTION
        ======================================================================== 
      */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-start pt-8 pb-12">
        
        {/* Background Image & Cinematic Gradient Overlay */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#030303]">
          <Image
            src="/hero-bg.jpg"
            alt="Emergency Medical Response"
            fill
            priority
            quality={100}
            unoptimized
            className="object-cover object-top opacity-[0.8]"
            style={{ filter: 'contrast(1.05) brightness(0.9) saturate(0.95)' }}
          />
          {/* Top gradient to fade into navbar gently */}
          <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#030303]/90 via-[#030303]/40 to-transparent" />
          {/* Bottom gradient to blend out the edge if page scrolls, reduced for visibility */}
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-transparent" />
          {/* Subtle radial overlay for focal depth, highly transparent in center to reveal image */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#030303_100%)] opacity-70" />
        </div>

        {/* Minimal Navigation */}
        <nav className="relative z-20 w-full max-w-7xl px-8 flex items-center justify-between mb-16 md:mb-24">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-400 rounded-md flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.4)]">
              <span className="text-[#030303] font-black text-sm tracking-tighter">R</span>
            </div>
            <span className="text-xl tracking-wide text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">ResQ</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
             <span className="text-cyan-400/90 text-xs font-semibold tracking-[0.2em] uppercase">
               Live
             </span>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-20 flex flex-col items-center text-center w-full max-w-7xl px-4 mt-4 md:mt-8 animate-fade-in flex-grow">
          
          {/* Live Badge */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" />
            <span className="text-orange-500/90 text-[11px] font-bold tracking-[0.2em] uppercase">
              Live Emergency Network
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-500 mb-6 leading-[1.1] drop-shadow-lg">
            Next-Gen Emergency <br /> Intelligence.
          </h1>

          {/* Subtitle */}
          <p className="text-[#CCC] text-lg md:text-xl tracking-wide max-w-2xl mx-auto mb-12">
            Seamlessly connecting patients, hospitals, and dispatchers in real-time.
          </p>

          {/* Spacer pushing the cards down */}
          <div className="flex-grow min-h-[40vh]"></div>

          {/* 
            ========================================================================
            PORTALS SECTION (Floating Transparent Glass Panels)
            ======================================================================== 
          */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto mt-auto pb-12">
            
            {/* Patient Portal Card */}
            <div 
              onClick={() => router.push('/login')}
              className="group cursor-pointer rounded-[24px] bg-transparent backdrop-blur-sm border border-white/[0.15] hover:border-neon-cyan/50 p-8 transition-all duration-500 hover:bg-neon-cyan/[0.05] shadow-[0_30px_60px_rgba(0,0,0,0.4)] hover:shadow-neon-cyan flex flex-col items-start text-left relative overflow-hidden"
            >
              {/* Internal top-edge highlight for glass effect */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 group-hover:via-neon-cyan/50" />
              
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-neon-cyan/10 group-hover:border-neon-cyan/30 transition-transform duration-500">
                <svg className="w-6 h-6 text-neon-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl text-neon-cyan mb-3 tracking-wide drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                Patient Login
              </h3>
              <p className="text-[15px] text-[#DDD] leading-relaxed mb-8 flex-grow drop-shadow-sm">
                Access your emergency profile, medical information, and dashboard.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 tracking-widest uppercase group-hover:text-neon-cyan transition-colors drop-shadow-md">
                Enter Patient Portal
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>

            {/* Hospital Portal Card */}
            <div 
              onClick={() => router.push('/hospital/login')}
              className="group cursor-pointer rounded-[24px] bg-transparent backdrop-blur-sm border border-white/[0.15] hover:border-blue-500/50 p-8 transition-all duration-500 hover:bg-blue-500/[0.05] shadow-[0_30px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] flex flex-col items-start text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 group-hover:via-blue-500/50" />
              
              <div className="absolute top-6 right-6 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/70 uppercase tracking-widest font-semibold drop-shadow-md group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/30">
                Partner
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-transform duration-500">
                <svg className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl text-blue-400 mb-3 tracking-wide drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">
                Hospital Login
              </h3>
              <p className="text-[15px] text-[#DDD] leading-relaxed mb-8 flex-grow drop-shadow-sm">
                Manage emergency cases, monitor capacity, and coordinate incoming ambulances.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 tracking-widest uppercase group-hover:text-blue-400 transition-colors drop-shadow-md">
                Enter Hospital Portal
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>

            {/* Admin Portal Card */}
            <div 
              onClick={() => router.push('/admin/login')}
              className="group cursor-pointer rounded-[24px] bg-transparent backdrop-blur-sm border border-white/[0.15] hover:border-purple-500/50 p-8 transition-all duration-500 hover:bg-purple-500/[0.05] shadow-[0_30px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] flex flex-col items-start text-left relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 group-hover:via-purple-500/50" />

              <div className="absolute top-6 right-6 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/70 uppercase tracking-widest font-semibold drop-shadow-md group-hover:bg-purple-500/10 group-hover:text-purple-400 group-hover:border-purple-500/30">
                Internal
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-transform duration-500">
                <svg className="w-6 h-6 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl text-purple-400 mb-3 tracking-wide drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                Admin Login
              </h3>
              <p className="text-[15px] text-[#DDD] leading-relaxed mb-8 flex-grow drop-shadow-sm">
                Monitor the emergency network, system activity, analytics, and operations.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 tracking-widest uppercase group-hover:text-purple-400 transition-colors drop-shadow-md">
                Enter Admin Portal
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>

          </div>

          {/* Massive Guest SOS Button - At the end of the page */}
          <div className="w-full max-w-4xl mx-auto mt-16 mb-8 group z-30 relative bg-[#030303] rounded-[32px]">
            <button 
              onClick={() => router.push('/sos')}
              className="relative w-full overflow-hidden rounded-[32px] p-[2px] shadow-emergency transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emergency-500 via-emergency-400 to-emergency-600 animate-pulse" />
              <div className="relative bg-dark-bg/90 backdrop-blur-xl rounded-[30px] px-8 py-12 flex flex-col items-center justify-center border border-emergency-500/50 group-hover:bg-emergency-500/10 transition-colors">
                <div className="w-20 h-20 rounded-full bg-emergency-500/20 flex items-center justify-center mb-6 group-hover:bg-emergency-500/40 transition-colors shadow-emergency">
                  <svg className="w-10 h-10 text-emergency-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-5xl text-emergency-500 tracking-widest font-bold mb-3 glow-text uppercase">Guest SOS</h2>
                <p className="text-neutral-400 text-sm tracking-widest uppercase font-mono">Immediate Ambulance Dispatch • No Account Required</p>
              </div>
            </button>
          </div>
          
        </div>
      </section>
    </div>
  );
}
