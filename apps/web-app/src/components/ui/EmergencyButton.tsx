'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface EmergencyButtonProps {
  onTrigger: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function EmergencyButton({ onTrigger, loading, disabled }: EmergencyButtonProps) {
  const [confirming, setConfirming] = useState(false);

  const handlePress = () => {
    if (confirming) {
      onTrigger();
      setConfirming(false);
    } else {
      setConfirming(true);
      // Auto-reset after 5 seconds if not confirmed
      setTimeout(() => setConfirming(false), 5000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handlePress}
        disabled={disabled || loading}
        className={cn(
          'relative w-48 h-48 rounded-full transition-all duration-300',
          'flex items-center justify-center',
          'text-white font-bold text-xl',
          'focus:outline-none focus:ring-4 focus:ring-emergency-400/50',
          !confirming && [
            'bg-emergency-500',
            'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
            'hover:shadow-[0_0_50px_rgba(239,68,68,0.5)]',
            'hover:scale-105',
            'animate-pulse-emergency',
          ],
          confirming && [
            'bg-emergency-700',
            'shadow-[0_0_60px_rgba(239,68,68,0.6)]',
            'scale-110',
          ],
          (disabled || loading) && 'opacity-50 cursor-not-allowed animate-none'
        )}
        aria-label={confirming ? 'Tap again to confirm emergency' : 'Trigger emergency'}
      >
        {/* Outer ring animation */}
        <span
          className={cn(
            'absolute inset-0 rounded-full border-4 border-emergency-400/40',
            confirming && 'animate-ping'
          )}
        />

        {/* Inner content */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          {loading ? (
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-semibold tracking-wider uppercase">
                {confirming ? 'Tap to Confirm' : 'Emergency'}
              </span>
            </>
          )}
        </div>
      </button>

      {/* Confirmation text */}
      <p
        className={cn(
          'text-sm transition-all duration-300',
          confirming
            ? 'text-emergency-600 font-medium opacity-100'
            : 'text-neutral-400 opacity-70'
        )}
      >
        {confirming
          ? 'Tap the button again to confirm and request help'
          : 'Tap if someone needs emergency medical help'}
      </p>
    </div>
  );
}
