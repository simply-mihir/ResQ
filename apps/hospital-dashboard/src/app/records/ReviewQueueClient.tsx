'use client';

import { useState } from 'react';
import { verifyRecord } from './actions';
import { Check, X, FileText, AlertTriangle } from 'lucide-react';

export default function ReviewQueueClient({ records }: { records: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleVerify = async (recordId: string, currentData: any) => {
    setLoadingId(recordId);
    await verifyRecord(recordId, currentData);
    setLoadingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800">Doctor Review Queue</h1>
        <p className="text-neutral-500">Verify AI-extracted medical records</p>
      </div>

      {records.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 text-center">
          <p className="text-neutral-500">No records pending review. Good job!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {records.map((record) => {
            const rawText = record.extractedData?.rawText || 'No text extracted';
            const isLowConfidence = record.extractionConfidence < 0.7;

            return (
              <div key={record.id} className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="bg-neutral-50 p-4 border-b border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800 capitalize">
                        {record.documentType.replace('_', ' ')}
                      </h3>
                      <p className="text-xs text-neutral-500">Patient ID: {record.patientId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={\`text-sm font-semibold \${isLowConfidence ? 'text-amber-500 flex items-center gap-1' : 'text-emerald-500'}\`}>
                      {isLowConfidence && <AlertTriangle size={16} />}
                      {(record.extractionConfidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-sm font-semibold text-neutral-500 mb-2 uppercase tracking-wide">Extracted Content</h4>
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 max-h-60 overflow-y-auto mb-6">
                    <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-sans">
                      {rawText}
                    </pre>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <button className="flex items-center gap-2 px-6 py-2 rounded-xl text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors font-medium">
                      <X size={18} /> Reject
                    </button>
                    <button 
                      onClick={() => handleVerify(record.id, record.extractedData)}
                      disabled={loadingId === record.id}
                      className="flex items-center gap-2 px-6 py-2 rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors font-medium"
                    >
                      {loadingId === record.id ? 'Saving...' : <><Check size={18} /> Verify & Save</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
