import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  testimonialText: string;
  testimonialAuthor: string;
  testimonialRole: string;
  imageSrc: string;
  imageAlt: string;
  badgeText: string;
  badgeColorClass: string;
}

export default function AuthLayout({
  children,
  testimonialText,
  testimonialAuthor,
  testimonialRole,
  imageSrc,
  imageAlt,
  badgeText,
  badgeColorClass,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-cyan-500/30 p-4 md:p-8 flex items-center justify-center">
      {/* 
        Main Container 
        Two-column layout matching the reference screenshot structure.
      */}
      <div className="w-full max-w-[1200px] min-h-[700px] bg-[#0A0A0C] border border-white/5 rounded-[40px] shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row relative">
        
        {/* LEFT COLUMN: Authentication Form */}
        <div className="w-full md:w-[50%] p-8 md:p-16 flex flex-col justify-center relative z-10 bg-[#0A0A0C]">
          {/* Minimal Branding at top left */}
          <div className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-400 rounded-md flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.4)]">
              <span className="text-[#030303] font-black text-sm tracking-tighter font-heading">R</span>
            </div>
            <Link href="/" className="text-xl tracking-wide text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] hover:text-cyan-300 transition-colors font-heading">
              ResQ
            </Link>
          </div>

          <div className="w-full max-w-sm mx-auto mt-12 md:mt-0">
            {children}
          </div>
        </div>

        {/* RIGHT COLUMN: Testimonial & Visual */}
        <div className="w-full md:w-[50%] bg-[#111116] relative flex flex-col justify-between overflow-hidden p-8 md:p-12 border-l border-white/5">
          {/* Subtle glow behind testimonial */}
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

          {/* Top: Testimonial Section */}
          <div className="relative z-20 max-w-md ml-auto mt-4 md:mt-8">
            <div className={`inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-semibold mb-6 ${badgeColorClass}`}>
              {badgeText}
            </div>
            
            <div className="relative">
              {/* Quote Mark */}
              <span className="absolute -top-6 -left-6 text-6xl text-white/5 font-serif leading-none">"</span>
              <p className="text-lg md:text-xl text-[#DDD] leading-relaxed tracking-wide mb-8 relative z-10">
                "{testimonialText}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white text-[15px] tracking-wider mb-1">{testimonialAuthor}</h4>
                  <p className="text-white/40 text-[12px] uppercase tracking-widest">{testimonialRole}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Cinematic Image */}
          <div className="absolute bottom-0 right-0 left-0 h-[50%] md:h-[60%] w-full z-10 overflow-hidden rounded-tl-[60px] md:rounded-tl-[80px]">
            {/* Image Overlay Gradient to blend seamlessly */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-[#111116]/80 z-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111116] via-transparent to-transparent z-20 opacity-50" />
            
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              quality={100}
              unoptimized
              className="object-cover object-center opacity-80"
              style={{ filter: 'contrast(1.1) brightness(0.9) saturate(0.9)' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
