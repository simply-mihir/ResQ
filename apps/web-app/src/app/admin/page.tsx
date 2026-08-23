'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Ambulance, 
  Users, 
  Building,
  FileText,
  Bell,
  Settings,
  LogOut,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Server,
  Activity,
  Wrench
} from 'lucide-react';
import DashboardLayout, { SidebarItem } from '@/components/layout/DashboardLayout';

function AdminOverview() {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/admin/overview')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(console.error);
  }, []);

  if (!data) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const { metrics, hospitals, cases, activity } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-slate-400 tracking-wider uppercase">Active Emergencies</span>
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{metrics.activeCases}</div>
            <div className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 w-max px-2 py-1 rounded-md">
              <ArrowUpRight className="w-3 h-3" />
              <span>Live tracking</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-slate-400 tracking-wider uppercase">Hospitals Online</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{metrics.hospitalsActive} <span className="text-lg text-slate-300">/ {metrics.hospitalsTotal}</span></div>
            <div className="text-xs font-semibold text-slate-500">
              Verified Partners
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-slate-400 tracking-wider uppercase">Ambulances Active</span>
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <Ambulance className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{metrics.ambulancesActive} <span className="text-lg text-slate-300">/ {metrics.ambulancesTotal}</span></div>
            <div className="text-xs font-semibold text-slate-500">
              Currently Available
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-slate-400 tracking-wider uppercase">Patients Assisted</span>
            <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{metrics.patientsAssisted}</div>
            <div className="flex items-center gap-1 text-xs font-semibold text-cyan-500 bg-cyan-50 w-max px-2 py-1 rounded-md">
              <ArrowUpRight className="w-3 h-3" />
              <span>Registered Network</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-bold text-slate-400 tracking-wider uppercase">Avg Response</span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">07:31</div>
            <div className="flex items-center gap-1 text-xs font-semibold text-green-500 bg-green-50 w-max px-2 py-1 rounded-md">
              <ArrowDownRight className="w-3 h-3" />
              <span>−9% this month</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Network Analytics Chart */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 lg:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900 tracking-wide">Emergency Network Activity</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">Today</button>
              <button className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-400">7 Days</button>
            </div>
          </div>
          
          <div className="flex-1 w-full relative flex items-end justify-between px-4 pb-6 min-h-[250px]">
            {/* Minimal line/area chart mockup */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              {[100, 75, 50, 25, 0].map(val => (
                <div key={val} className="w-full border-t border-slate-100 flex items-center">
                  <span className="text-[10px] text-slate-400 -translate-y-1/2 -translate-x-6 absolute">{val}</span>
                </div>
              ))}
            </div>
            
            <svg className="absolute inset-0 w-full h-[calc(100%-1.5rem)] overflow-visible" preserveAspectRatio="none">
              <path d="M 0 180 Q 50 150 100 120 T 200 80 T 300 130 T 400 40 T 500 90 T 600 20 L 600 250 L 0 250 Z" fill="rgba(168, 85, 247, 0.1)" />
              <path d="M 0 180 Q 50 150 100 120 T 200 80 T 300 130 T 400 40 T 500 90 T 600 20" fill="none" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
            </svg>
            
            <div className="absolute bottom-0 w-full flex justify-between text-xs text-slate-400 font-medium px-2">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
            </div>
          </div>
        </div>

        {/* Hospital Network List */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 lg:px-8 lg:pt-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-wide">Hospital Network</h2>
            <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 tracking-wide">View All</button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-3 text-[10px] uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100">Hospital</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100">Status</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100 text-right">Metrics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {hospitals.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <p className="text-sm font-bold text-slate-700">{row.name}</p>
                      <p className="text-xs text-slate-400">{row.loc}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                        row.stat === 'Online' ? 'bg-green-100 text-green-600' :
                        row.stat === 'High Load' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {row.stat}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="text-xs font-semibold text-slate-700">{row.beds} / {row.totalBeds} beds free</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Emergency Network */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 lg:px-8 lg:pt-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-wide">Live Emergency Network</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Live Tracking</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100">ID</th>
                  <th className="px-4 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100">Patient</th>
                  <th className="px-4 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100">Severity</th>
                  <th className="px-4 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100">Routing</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cases.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">{row.id}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-700">{row.name}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                        row.sev === 'CRITICAL' ? 'bg-red-100 text-red-600 border border-red-200' :
                        row.sev === 'HIGH' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {row.sev}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{row.dest}</p>
                      <p className="text-xs text-slate-500">via {row.amb}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-slate-900">{row.stat}</p>
                      <p className="text-xs font-medium text-slate-500">{row.eta}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity Logs */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="text-lg font-bold text-slate-900 tracking-wide mb-6">System Activity</h2>
          
          <div className="space-y-6">
            {activity.map((act: any, i: number) => (
              <div key={i} className="flex gap-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${act.type === 'red' ? 'bg-red-100 text-red-600' : act.type === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                  {act.type === 'red' ? <AlertTriangle className="w-3 h-3" /> : act.type === 'blue' ? <Ambulance className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">{act.msg}</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5 max-w-[200px] truncate">{act.detail}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');

  const sidebarItems: SidebarItem[] = [
    { name: 'Overview', href: '#', icon: <LayoutDashboard className="w-5 h-5" />, onClick: () => setActiveTab('Overview'), active: activeTab === 'Overview' },
    { name: 'Emergency Network', href: '#', icon: <Activity className="w-5 h-5" />, onClick: () => setActiveTab('Emergency Network'), active: activeTab === 'Emergency Network' },
    { name: 'Hospitals', href: '#', icon: <Building className="w-5 h-5" />, onClick: () => setActiveTab('Hospitals'), active: activeTab === 'Hospitals' },
    { name: 'Ambulances', href: '#', icon: <Ambulance className="w-5 h-5" />, onClick: () => setActiveTab('Ambulances'), active: activeTab === 'Ambulances' },
    { name: 'Patients', href: '#', icon: <Users className="w-5 h-5" />, onClick: () => setActiveTab('Patients'), active: activeTab === 'Patients' },
    { name: 'Dispatchers', href: '#', icon: <Server className="w-5 h-5" />, onClick: () => setActiveTab('Dispatchers'), active: activeTab === 'Dispatchers' },
    { name: 'Analytics', href: '#', icon: <FileText className="w-5 h-5" />, onClick: () => setActiveTab('Analytics'), active: activeTab === 'Analytics' },
    { name: 'System Logs', href: '#', icon: <AlertTriangle className="w-5 h-5" />, onClick: () => setActiveTab('System Logs'), active: activeTab === 'System Logs' },
  ];

  const bottomItems: SidebarItem[] = [
    { name: 'Notifications', href: '#', icon: <Bell className="w-5 h-5" />, onClick: () => setActiveTab('Notifications'), active: activeTab === 'Notifications' },
    { name: 'Settings', href: '#', icon: <Settings className="w-5 h-5" />, onClick: () => setActiveTab('Settings'), active: activeTab === 'Settings' },
    { name: 'Admin Profile', href: '#', icon: <Users className="w-5 h-5" />, onClick: () => setActiveTab('Admin Profile'), active: activeTab === 'Admin Profile' },
    { name: 'Logout', href: '/', icon: <LogOut className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    if (activeTab === 'Overview') {
      return <AdminOverview />;
    }

    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-[24px] border border-slate-200 shadow-sm p-8">
        <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center text-purple-400 mb-6 border border-purple-100">
          <Wrench className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">{activeTab}</h2>
        <p className="text-slate-500 text-center max-w-md font-medium leading-relaxed">
          The <span className="text-purple-600 font-bold">{activeTab}</span> module is currently under development. Detailed views and analytics will be available in the upcoming release.
        </p>
      </div>
    );
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      bottomItems={bottomItems}
      pageTitle={activeTab === 'Overview' ? "Network Overview" : activeTab}
      pageSubtitle={activeTab === 'Overview' ? "Monitor the ResQ emergency network across hospitals, ambulances, and active cases." : `Manage and monitor ${activeTab.toLowerCase()} data.`}
      themeColorClass="bg-purple-600 text-white"
      themeTextClass="text-purple-500"
      rightContent={
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-[11px] font-bold text-purple-700 tracking-widest uppercase">Live Network</span>
        </div>
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
}
