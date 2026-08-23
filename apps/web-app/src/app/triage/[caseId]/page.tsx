'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassBackground } from '@/components/layout/GlassBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassNavbar } from '@/components/ui/GlassNavbar';
import { api } from '@/lib/api';

export default function TriageScreen({ params }: { params: { caseId: string } }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({
    conscious: null as boolean | null,
    breathing: null as boolean | null,
    bleeding: null as boolean | null,
  });

  const allAnswered = answers.conscious !== null && answers.breathing !== null && answers.bleeding !== null;

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    try {
      await api.emergency.submitTriage(params.caseId, {
        conscious: answers.conscious!,
        breathing: answers.breathing!,
        bleeding: answers.bleeding!,
      });
      alert('Medical details submitted to the hospital.');
      router.push(`/matching/${params.caseId}`);
    } catch (error) {
      console.error(error);
      alert('Failed to submit triage');
      setSubmitting(false);
    }
  };

  const renderQuestion = (
    key: keyof typeof answers,
    title: string,
    desc: string
  ) => (
    <GlassCard level={2} padding="md" className="mb-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-neutral-800">{title}</h3>
        <p className="text-sm text-neutral-600">{desc}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setAnswers(prev => ({ ...prev, [key]: true }))}
          className={`py-3 rounded-xl font-medium transition-all ${
            answers[key] === true 
              ? 'bg-primary-600 text-white shadow-lg' 
              : 'bg-white/50 text-neutral-700 hover:bg-white'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => setAnswers(prev => ({ ...prev, [key]: false }))}
          className={`py-3 rounded-xl font-medium transition-all ${
            answers[key] === false 
              ? 'bg-emergency-600 text-white shadow-lg' 
              : 'bg-white/50 text-neutral-700 hover:bg-white'
          }`}
        >
          No
        </button>
      </div>
    </GlassCard>
  );

  return (
    <GlassBackground variant="calm">
      <GlassNavbar variant="transparent">
        <span className="font-semibold text-neutral-800">Emergency Assessment</span>
      </GlassNavbar>

      <main className="max-w-md mx-auto px-4 pt-20 pb-24 min-h-screen flex flex-col">
        <div className="mb-6">
          <div className="bg-green-100 border border-green-200 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-sm animate-pulse-slow">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-green-900">Ambulance Dispatched!</h2>
              <p className="text-sm text-green-800 mt-1">
                Help is on the way to your location. While you wait, please provide medical details to prepare the hospital.
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-neutral-900">Patient Status</h1>
          <p className="text-neutral-600 text-sm mt-1">Please answer quickly so we can dispatch the right specialists.</p>
        </div>

        {renderQuestion('conscious', 'Is the patient conscious?', 'Are they awake and responding to you?')}
        {renderQuestion('breathing', 'Are they breathing normally?', 'Look for chest rising and falling.')}
        {renderQuestion('bleeding', 'Is there severe bleeding?', 'Look for large pools of blood or continuous flow.')}

        <div className="mt-auto pt-6">
          <button
            disabled={!allAnswered || submitting}
            onClick={handleSubmit}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all ${
              allAnswered && !submitting
                ? 'bg-primary-600 hover:bg-primary-700 hover:-translate-y-1'
                : 'bg-neutral-400 cursor-not-allowed opacity-70'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Medical Details'}
          </button>
        </div>
      </main>
    </GlassBackground>
  );
}
