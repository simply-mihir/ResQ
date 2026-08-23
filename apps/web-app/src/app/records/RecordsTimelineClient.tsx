'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function RecordsTimelineClient({ initialRecords, patientId }: { initialRecords: any[], patientId: string }) {
  const [records, setRecords] = useState(initialRecords);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', patientId);

    try {
      const res = await fetch('http://localhost:3003/api/v1/records/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        // Optimistically add to UI or reload
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Medical Records</h1>
          <p className="text-neutral-500">Your health history and documents</p>
        </div>
        
        <div>
          <label className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-2">
            {isUploading ? <span className="animate-pulse">Uploading...</span> : <><Upload size={18} /> Upload Record</>}
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      <div className="space-y-6">
        {records.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-neutral-100">
            <p className="text-neutral-500">No medical records found.</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${record.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-600' : record.status === 'AI_EXTRACTED' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 capitalize">
                      {record.documentType ? record.documentType.replace('_', ' ') : 'Document'}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Uploaded on {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {record.status === 'VERIFIED' && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"><CheckCircle size={14} /> Verified by Doctor</span>}
                  {record.status === 'AI_EXTRACTED' && <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg"><Clock size={14} /> Pending Review</span>}
                  {record.status === 'PROCESSING' && <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg"><Clock size={14} /> AI Processing</span>}
                </div>
              </div>

              {record.extractedData?.rawText && (
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 mt-4 max-h-32 overflow-hidden relative">
                  <p className="text-sm text-neutral-600 font-sans line-clamp-3">
                    {record.extractedData.rawText}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-neutral-50 to-transparent"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
