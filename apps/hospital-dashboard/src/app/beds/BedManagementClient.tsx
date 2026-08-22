'use client';

import { useState } from 'react';
import { updateBeds } from './actions';
import { BedDouble, Activity, CheckCircle2 } from 'lucide-react';

export default function BedManagementClient({ hospital }: { hospital: any }) {
  const [beds, setBeds] = useState(hospital.bedCapacityFree);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updated, setUpdated] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await updateBeds(hospital.id, beds);
    setIsUpdating(false);
    setUpdated(true);
    setTimeout(() => setUpdated(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">{hospital.name}</h1>
        <p className="text-neutral-500">Resource & Bed Management Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col gap-2">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-2">
            <BedDouble size={20} />
          </div>
          <p className="text-neutral-500 text-sm font-medium">Total Bed Capacity</p>
          <p className="text-3xl font-bold text-neutral-800">{hospital.bedCapacityTotal}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col gap-2">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-2">
            <Activity size={20} />
          </div>
          <p className="text-neutral-500 text-sm font-medium">Available Beds</p>
          <p className="text-3xl font-bold text-emerald-600">{hospital.bedCapacityFree}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col gap-2">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <p className="text-neutral-500 text-sm font-medium">Hospital Rating</p>
          <p className="text-3xl font-bold text-amber-500">{hospital.rating.toFixed(1)} / 5.0</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 max-w-xl">
        <h2 className="text-xl font-bold text-neutral-800 mb-6">Update Available Beds</h2>
        
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium text-neutral-600">Current Available Beds (including ICU & general)</label>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setBeds(Math.max(0, beds - 1))}
              className="w-12 h-12 rounded-xl border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 text-xl font-medium"
            >
              -
            </button>
            <input 
              type="number"
              value={beds}
              onChange={(e) => setBeds(parseInt(e.target.value) || 0)}
              className="w-24 h-12 rounded-xl border border-neutral-200 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button 
              onClick={() => setBeds(Math.min(hospital.bedCapacityTotal, beds + 1))}
              className="w-12 h-12 rounded-xl border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 text-xl font-medium"
            >
              +
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors min-w-[150px] flex items-center justify-center"
            >
              {isUpdating ? 'Updating...' : 'Save Capacity'}
            </button>
            {updated && <div className="text-emerald-500 flex items-center gap-2"><CheckCircle2 size={18} /> Updated</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
