import React from 'react';

interface SimulatedBadgeProps {
  className?: string;
}

export function SimulatedBadge({ className = '' }: SimulatedBadgeProps) {
  return (
    <span 
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 border border-purple-200 ml-2 tracking-wider uppercase ${className}`}
      title="This data is simulated for demonstration purposes"
    >
      Simulated
    </span>
  );
}
