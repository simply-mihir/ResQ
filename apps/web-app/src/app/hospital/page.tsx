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
  Stethoscope,
  BedDouble,
  Activity,
  ArrowRight,
  Clock,
  Wrench,
  HeartPulse,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import DashboardLayout, { SidebarItem } from '@/components/layout/DashboardLayout';

export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');

  const sidebarItems: SidebarItem[] = [
    { name: 'Overview', href: '#', icon: <LayoutDashboard className="w-5 h-5" />, onClick: () => setActiveTab('Overview'), active: activeTab === 'Overview' },
    { name: 'Emergency Cases', href: '#', icon: <AlertTriangle className="w-5 h-5" />, onClick: () => setActiveTab('Emergency Cases'), active: activeTab === 'Emergency Cases' },
    { name: 'Ambulances', href: '#', icon: <Ambulance className="w-5 h-5" />, onClick: () => setActiveTab('Ambulances'), active: activeTab === 'Ambulances' },
    { name: 'Patients', href: '#', icon: <Users className="w-5 h-5" />, onClick: () => setActiveTab('Patients'), active: activeTab === 'Patients' },
    { name: 'Bed Capacity', href: '#', icon: <BedDouble className="w-5 h-5" />, onClick: () => setActiveTab('Bed Capacity'), active: activeTab === 'Bed Capacity' },
    { name: 'Medical Staff', href: '#', icon: <Stethoscope className="w-5 h-5" />, onClick: () => setActiveTab('Medical Staff'), active: activeTab === 'Medical Staff' },
    { name: 'Reports', href: '#', icon: <FileText className="w-5 h-5" />, onClick: () => setActiveTab('Reports'), active: activeTab === 'Reports' },
  ];

  const bottomItems: SidebarItem[] = [
    { name: 'Notifications', href: '#', icon: <Bell className="w-5 h-5" />, onClick: () => setActiveTab('Notifications'), active: activeTab === 'Notifications' },
    { name: 'Settings', href: '#', icon: <Settings className="w-5 h-5" />, onClick: () => setActiveTab('Settings'), active: activeTab === 'Settings' },
    { name: 'Hospital Profile', href: '#', icon: <Building className="w-5 h-5" />, onClick: () => setActiveTab('Hospital Profile'), active: activeTab === 'Hospital Profile' },
    { name: 'Logout', href: '/', icon: <LogOut className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    if (activeTab === 'Overview') {
      return (
        <div className="space-y-6">
          {/* 
            =========================================================
            STATISTICS CARDS ROW
            ========================================================= 
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Active Emergencies */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Active Emergencies</span>
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-slate-900 mb-1">12</div>
                <div className="flex items-center gap-1 text-sm font-medium text-red-500 bg-red-50 w-max px-2 py-1 rounded-md">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+3 today</span>
                </div>
              </div>
            </div>

            {/* Available Beds */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Available Beds</span>
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-slate-900 mb-1">48</div>
                <div className="text-sm font-medium text-slate-500">
                  12 ICU • 36 General
                </div>
              </div>
            </div>

            {/* Incoming Ambulances */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Incoming Ambulances</span>
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Ambulance className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-slate-900 mb-1">7</div>
                <div className="flex items-center gap-1 text-sm font-medium text-blue-500 bg-blue-50 w-max px-2 py-1 rounded-md">
                  <Clock className="w-3 h-3" />
                  <span>3 arriving soon</span>
                </div>
              </div>
            </div>

            {/* Avg Response Time */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-500 tracking-wide uppercase">Avg Response Time</span>
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-slate-900 mb-1">08:42</div>
                <div className="flex items-center gap-1 text-sm font-medium text-green-500 bg-green-50 w-max px-2 py-1 rounded-md">
                  <ArrowDownRight className="w-3 h-3" />
                  <span>−12% this week</span>
                </div>
              </div>
            </div>
          </div>

          {/* 
            =========================================================
            MIDDLE ROW (Charts & Capacity)
            ========================================================= 
          */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Emergency Activity Chart */}
            <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 lg:p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-slate-900 tracking-wide">Emergency Activity</h2>
                <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 font-medium">
                  <option>Today</option>
                  <option>Last 7 Days</option>
                </select>
              </div>
              
              <div className="w-full h-[220px] relative flex items-end justify-between px-4 pb-6">
                {/* Minimal mockup of a bar chart */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                  {[40, 30, 20, 10, 0].map(val => (
                    <div key={val} className="w-full border-t border-slate-100 flex items-center">
                      <span className="text-[10px] text-slate-400 -translate-y-1/2 -translate-x-6 absolute">{val}</span>
                    </div>
                  ))}
                </div>
                
                {[
                  { h: '60%', bg: 'bg-blue-100', val: '6am' },
                  { h: '40%', bg: 'bg-blue-100', val: '9am' },
                  { h: '90%', bg: 'bg-red-400', val: '12pm' },
                  { h: '75%', bg: 'bg-blue-400', val: '3pm' },
                  { h: '45%', bg: 'bg-blue-100', val: '6pm' },
                  { h: '30%', bg: 'bg-blue-100', val: '9pm' },
                ].map((bar, i) => (
                  <div key={i} className="w-12 flex flex-col items-center gap-3 z-10 h-full justify-end group">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80 ${bar.bg}`}
                      style={{ height: bar.h }}
                    />
                    <span className="text-xs text-slate-500 font-medium">{bar.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hospital Capacity */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 lg:p-8">
              <h2 className="text-lg font-bold text-slate-900 tracking-wide mb-8">Hospital Capacity</h2>
              
              <div className="space-y-6">
                {/* ICU */}
                <div>
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-slate-700">Intensive Care Unit (ICU)</span>
                    <span className="text-red-500">82%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>

                {/* Emergency */}
                <div>
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-slate-700">Emergency Ward</span>
                    <span className="text-orange-500">64%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: '64%' }} />
                  </div>
                </div>

                {/* General */}
                <div>
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-slate-700">General Ward</span>
                    <span className="text-blue-500">51%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: '51%' }} />
                  </div>
                </div>

                {/* OR */}
                <div>
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-slate-700">Operating Rooms</span>
                    <span className="text-purple-500">70%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 
            =========================================================
            BOTTOM ROW (Tables & Feed)
            ========================================================= 
          */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active Emergency Cases Table */}
            <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 lg:px-8 lg:pt-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 tracking-wide">Active Emergency Cases</h2>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 tracking-wide">View All</button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-xs uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100">Patient</th>
                      <th className="px-4 py-4 text-xs uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100">Severity</th>
                      <th className="px-4 py-4 text-xs uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100">Type</th>
                      <th className="px-4 py-4 text-xs uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100">Ambulance</th>
                      <th className="px-8 py-4 text-xs uppercase tracking-widest text-slate-400 font-semibold border-b border-slate-100 text-right">ETA / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { name: 'John Doe', sev: 'Critical', type: 'Cardiac Arrest', amb: 'AMB-104', stat: '04 min' },
                      { name: 'Sarah Smith', sev: 'High', type: 'Trauma', amb: 'AMB-092', stat: '12 min' },
                      { name: 'Michael Chen', sev: 'Stable', type: 'Fracture', amb: 'AMB-115', stat: 'Admitted' },
                      { name: 'Unknown', sev: 'Critical', type: 'Stroke Protocol', amb: 'AMB-088', stat: '02 min' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4 text-sm font-bold text-slate-700">{row.name}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                            row.sev === 'Critical' ? 'bg-red-100 text-red-600' :
                            row.sev === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {row.sev}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-500">{row.type}</td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-700">{row.amb}</td>
                        <td className="px-8 py-4 text-sm font-bold text-slate-900 text-right">
                          {row.stat}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 lg:p-8">
              <h2 className="text-lg font-bold text-slate-900 tracking-wide mb-6">Recent Activity</h2>
              
              <div className="space-y-6">
                {[
                  { time: 'Just now', msg: 'Ambulance AMB-104 is 4 minutes away', icon: <Ambulance className="w-4 h-4" />, color: 'bg-blue-100 text-blue-600' },
                  { time: '2 min ago', msg: 'Critical patient assigned to Emergency Ward', icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-red-100 text-red-600' },
                  { time: '15 min ago', msg: 'ICU capacity updated to 82%', icon: <HeartPulse className="w-4 h-4" />, color: 'bg-purple-100 text-purple-600' },
                  { time: '1 hr ago', msg: 'Patient successfully admitted', icon: <Users className="w-4 h-4" />, color: 'bg-green-100 text-green-600' },
                  { time: '2 hrs ago', msg: 'New emergency case received', icon: <Bell className="w-4 h-4" />, color: 'bg-orange-100 text-orange-600' },
                ].map((activity, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-0.5">{activity.msg}</p>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-[24px] border border-slate-200 shadow-sm p-8">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-400 mb-6 border border-blue-100">
          <Wrench className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">{activeTab}</h2>
        <p className="text-slate-500 text-center max-w-md font-medium leading-relaxed">
          The <span className="text-blue-600 font-bold">{activeTab}</span> module is currently under development. Detailed views and records will be available in the upcoming release.
        </p>
      </div>
    );
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      bottomItems={bottomItems}
      pageTitle={activeTab === 'Overview' ? "Emergency Overview" : activeTab}
      pageSubtitle={activeTab === 'Overview' ? "ResQ Central Hospital" : `Manage and monitor ${activeTab.toLowerCase()} data.`}
      themeColorClass="bg-blue-600 text-white"
      themeTextClass="text-blue-500"
      rightContent={
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[11px] font-bold text-blue-700 tracking-widest uppercase">Online & Receiving</span>
        </div>
      }
    >
      {renderContent()}
    </DashboardLayout>
  );
}
