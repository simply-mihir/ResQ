import React from 'react';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <span className="font-bold text-white text-sm">H</span>
          </div>
          <div>
            <h1 className="font-bold tracking-wide">HEALTH</h1>
            <p className="text-[10px] text-blue-400 font-medium uppercase tracking-widest">Dispatch Center</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 text-blue-400 rounded-xl font-medium transition-colors border border-blue-500/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Active Emergencies
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-700/30 hover:text-slate-200 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </a>
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600"></div>
            <div className="text-sm">
              <p className="font-medium">Dr. Smith</p>
              <p className="text-xs text-slate-400">City Hospital</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <h2 className="font-semibold text-lg">Command Center</h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Connection
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800">
          {children}
        </div>
      </main>
    </div>
  );
};
