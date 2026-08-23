'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FuturisticPatientLayout from '@/components/layout/FuturisticPatientLayout';
import { QRCodeSVG } from 'qrcode.react';
import { saveProfile } from './actions';
import { Save, ShieldAlert, Activity, Heart, Phone, FileText } from 'lucide-react';

interface ProfileData {
  id: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  qrToken: string;
}

export default function EmergencyProfileForm({
  userId,
  userName,
  profile,
}: {
  userId: string;
  userName: string;
  profile: ProfileData | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: userName,
    bloodGroup: profile?.bloodGroup || '',
    allergies: profile?.allergies.join(', ') || '',
    chronicConditions: profile?.chronicConditions.join(', ') || '',
    currentMedications: profile?.currentMedications.join(', ') || '',
    emergencyContactName: profile?.emergencyContactName || '',
    emergencyContactPhone: profile?.emergencyContactPhone || '',
    insuranceProvider: profile?.insuranceProvider || '',
    insurancePolicyNumber: profile?.insurancePolicyNumber || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await saveProfile(userId, {
        name: formData.name,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: formData.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
        currentMedications: formData.currentMedications.split(',').map(s => s.trim()).filter(Boolean),
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        insuranceProvider: formData.insuranceProvider,
        insurancePolicyNumber: formData.insurancePolicyNumber,
      });
      setSaved(true);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const InputLabel = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
    <label className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">
      {Icon && <Icon className="w-3 h-3 text-neon-cyan" />}
      {children}
    </label>
  );

  const inputClass = "w-full px-4 py-3 rounded-xl border border-white/10 bg-dark-bg focus:bg-white/5 focus:border-neon-lime focus:ring-1 focus:ring-neon-lime outline-none transition-all text-white placeholder-neutral-600";

  return (
    <FuturisticPatientLayout>
      <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="w-4 h-4 text-neon-cyan" />
              <span className="text-neon-cyan text-xs tracking-[0.3em] font-bold uppercase">Medical Data</span>
            </div>
            <h1 className="text-4xl text-white tracking-wide glow-text">Emergency Profile</h1>
            <p className="text-neutral-400 mt-2 tracking-wider text-sm">Critical health data transmitted to first responders upon SOS trigger.</p>
          </div>

          {profile?.qrToken && (
            <div className="futuristic-card p-4 flex items-center gap-6 border border-neon-lime/30">
              <div className="bg-white p-2 rounded-lg">
                <QRCodeSVG value={profile.qrToken} size={80} level="Q" />
              </div>
              <div>
                <p className="text-[10px] text-neon-lime font-bold uppercase tracking-widest mb-1">Identity Token</p>
                <p className="text-xs text-neutral-400 font-mono tracking-widest">{profile.qrToken.slice(0, 12)}...</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="futuristic-card p-6 md:p-8">
              <h2 className="text-xl text-white mb-6 tracking-wide flex items-center gap-2 border-b border-white/5 pb-4">
                <User className="w-5 h-5 text-neon-lime" /> Personal Intel
              </h2>

              <div className="space-y-5">
                <div>
                  <InputLabel icon={User}>Full Name</InputLabel>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={inputClass}
                    placeholder="Subject Name"
                  />
                </div>

                <div>
                  <InputLabel icon={Activity}>Blood Group</InputLabel>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => handleChange('bloodGroup', e.target.value)}
                    className={inputClass}
                  >
                    <option value="" className="bg-dark-bg text-neutral-500">Unspecified</option>
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg} className="bg-dark-bg">{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="futuristic-card p-6 md:p-8">
              <h2 className="text-xl text-white mb-6 tracking-wide flex items-center gap-2 border-b border-white/5 pb-4">
                <Phone className="w-5 h-5 text-neon-cyan" /> Emergency Contact
              </h2>

              <div className="space-y-5">
                <div>
                  <InputLabel icon={User}>Contact Name</InputLabel>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                    className={inputClass}
                    placeholder="Primary Contact"
                  />
                </div>

                <div>
                  <InputLabel icon={Phone}>Comm Link (Phone)</InputLabel>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                    className={inputClass}
                    placeholder="+91 XXX XXX XXXX"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div className="futuristic-card p-6 md:p-8 border border-neon-cyan/20">
            <h2 className="text-xl text-white mb-6 tracking-wide flex items-center gap-2 border-b border-white/5 pb-4">
              <Heart className="w-5 h-5 text-emergency-500" /> Vital Medical Data
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <InputLabel icon={Activity}>Allergies</InputLabel>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => handleChange('allergies', e.target.value)}
                  className={`${inputClass} min-h-[100px] resize-none`}
                  placeholder="e.g. Penicillin, Peanuts (comma-separated)"
                />
              </div>

              <div>
                <InputLabel icon={ShieldAlert}>Chronic Conditions</InputLabel>
                <textarea
                  value={formData.chronicConditions}
                  onChange={(e) => handleChange('chronicConditions', e.target.value)}
                  className={`${inputClass} min-h-[100px] resize-none`}
                  placeholder="e.g. Type 1 Diabetes, Asthma"
                />
              </div>

              <div>
                <InputLabel icon={FileText}>Active Medications</InputLabel>
                <textarea
                  value={formData.currentMedications}
                  onChange={(e) => handleChange('currentMedications', e.target.value)}
                  className={`${inputClass} min-h-[100px] resize-none`}
                  placeholder="e.g. Metformin 500mg, Lisinopril"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={saving}
              className={`px-8 py-4 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center gap-3 ${
                saving
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                  : saved
                  ? 'bg-neon-lime/20 text-neon-lime border border-neon-lime shadow-neon-lime'
                  : 'bg-dark-card text-white futuristic-border hover:bg-neon-lime hover:text-black hover:shadow-neon-lime-strong'
              }`}
            >
              <Save className={`w-5 h-5 ${saved ? 'text-neon-lime' : saving ? 'text-neutral-500' : 'text-neon-lime group-hover:text-black'}`} />
              {saving ? 'Syncing...' : saved ? 'Data Synchronized' : 'Sync Profile Data'}
            </button>
          </div>
        </form>
      </div>
    </FuturisticPatientLayout>
  );
}
