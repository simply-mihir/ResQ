'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, User } from 'lucide-react';
import { Raleway } from 'next/font/google';

const raleway = Raleway({ subsets: ['latin'] });

export interface SidebarItem {
  name: string;
  href?: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  bottomItems: SidebarItem[];
  pageTitle: string;
  pageSubtitle: string;
  rightContent?: React.ReactNode;
  themeColorClass?: string;
  themeTextClass?: string;
}

export default function DashboardLayout({
  children,
  sidebarItems,
  bottomItems,
  pageTitle,
  pageSubtitle,
  rightContent,
  themeColorClass = 'bg-blue-500 text-white',
  themeTextClass = 'text-blue-500',
}: DashboardLayoutProps) {
  return (
    <div className={`flex h-screen w-full bg-[#F4F6F8] overflow-hidden text-slate-800 ${raleway.className}`}>
      
      {/* 
        =========================================================
        LEFT SIDEBAR (Dark Theme)
        ========================================================= 
      */}
      <aside className="w-[280px] bg-[#0A0A0C] border-r border-white/5 flex flex-col h-full flex-shrink-0 relative overflow-hidden">
        {/* Subtle glow for sidebar depth */}
        <div className={`absolute top-[-10%] left-[-20%] w-[200px] h-[200px] rounded-full blur-[80px] opacity-10 ${themeColorClass.split(' ')[0]}`} />
        
        {/* Brand Header */}
        <div className="h-[88px] px-8 flex items-center gap-3 relative z-10 border-b border-white/5">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center shadow-lg ${themeColorClass}`}>
            <span className="font-black text-sm tracking-tighter">R</span>
          </div>
          <span className={`text-xl tracking-wide ${themeTextClass} drop-shadow-md`}>
            ResQ
          </span>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 px-4 py-6 overflow-y-auto z-10 space-y-1 scrollbar-hide">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 pl-4">
            Menu
          </div>
          {sidebarItems.map((item) => {
            const isButton = !!item.onClick || item.href === '#';
            const Wrapper: any = isButton ? 'button' : Link;
            const props = isButton ? { onClick: item.onClick, type: 'button' as const } : { href: item.href! };

            return (
              <Wrapper 
                key={item.name} 
                {...props}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                  item.active 
                    ? `${themeColorClass} shadow-lg` 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className={item.active ? 'opacity-100' : 'opacity-70'}>{item.icon}</div>
                <span className="text-[14px] tracking-wide font-medium text-left">{item.name}</span>
              </Wrapper>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="px-4 py-6 border-t border-white/5 z-10 space-y-1">
          {bottomItems.map((item) => {
            const isButton = !!item.onClick || item.href === '#';
            const Wrapper: any = isButton ? 'button' : Link;
            const props = isButton ? { onClick: item.onClick, type: 'button' as const } : { href: item.href! };

            return (
              <Wrapper 
                key={item.name} 
                {...props}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              >
                <div className="opacity-70">{item.icon}</div>
                <span className="text-[14px] tracking-wide font-medium text-left">{item.name}</span>
              </Wrapper>
            );
          })}
        </div>
      </aside>

      {/* 
        =========================================================
        MAIN WORKSPACE (Light Theme)
        ========================================================= 
      */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="h-[88px] px-8 flex items-center justify-between border-b border-slate-200 bg-white flex-shrink-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{pageTitle}</h1>
            <p className="text-sm text-slate-500 mt-1 tracking-wide">{pageSubtitle}</p>
          </div>
          
          <div className="flex items-center gap-6">
            {rightContent}
            
            <div className="w-px h-8 bg-slate-200 mx-2" />
            
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className={`absolute top-0 right-0 w-2 h-2 rounded-full border-2 border-white ${themeColorClass}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10 scrollbar-hide">
          <div className="max-w-[1600px] mx-auto w-full space-y-6">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
}
