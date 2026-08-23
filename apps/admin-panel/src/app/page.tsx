'use client';

import { Activity, Ambulance, Users, HeartPulse, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Active Emergencies', value: '24', icon: Activity, color: 'text-red-400' },
  { label: 'Dispatched Ambulances', value: '18', icon: Ambulance, color: 'text-blue-400' },
  { label: 'Available Beds', value: '142', icon: HeartPulse, color: 'text-green-400' },
  { label: 'On-Duty Doctors', value: '89', icon: Users, color: 'text-purple-400' },
];

const recentAlerts = [
  { id: 1, type: 'Critical', message: 'Cardiac Arrest - Unit 4 Dispatched', time: '2 min ago', icon: AlertTriangle, color: 'text-red-400' },
  { id: 2, type: 'Warning', message: 'High Wait Time at City Hospital', time: '15 min ago', icon: Clock, color: 'text-yellow-400' },
  { id: 3, type: 'System', message: 'Triage AI Model Updated Successfully', time: '1 hr ago', icon: ShieldCheck, color: 'text-blue-400' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen p-6 lg:p-12 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 text-glow">
              Command Center
            </h1>
            <p className="text-gray-400 text-lg">System Overview & Live Analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-gray-300 font-medium">All Systems Operational</span>
          </div>
        </motion.header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 flex flex-col gap-4 group hover:bg-white/5 transition-all duration-300 cursor-default"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-1 group-hover:scale-105 transform origin-left transition-transform">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-400">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Map Placeholder */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass-card p-6 min-h-[400px] flex flex-col"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Live Regional Dispatch Map
            </h2>
            <div className="flex-1 bg-black/20 rounded-lg border border-white/5 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://maps.gstatic.com/mapfiles/transparent.png')] opacity-10 mix-blend-overlay"></div>
              <p className="text-gray-500 text-sm">Interactive Map Integration Pending API Configuration</p>
            </div>
          </motion.div>

          {/* System Alerts */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 flex flex-col"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Recent Alerts
            </h2>
            <div className="space-y-4 flex-1">
              {recentAlerts.map((alert, i) => (
                <div key={alert.id} className="flex gap-4 items-start p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className={`mt-1 ${alert.color}`}>
                    <alert.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="/analytics" className="block w-full mt-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white text-center transition-colors">
              View Analytics Dashboard
            </a>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
