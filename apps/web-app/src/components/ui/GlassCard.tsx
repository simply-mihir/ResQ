import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type GlassLevel = 1 | 2 | 3 | 'dark';

interface GlassCardProps {
  children: ReactNode;
  level?: GlassLevel;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const glassStyles: Record<GlassLevel, string> = {
  1: 'bg-white/60 backdrop-blur-[12px] border border-white/30 shadow-glass-1',
  2: 'bg-white/70 backdrop-blur-[16px] border border-white/40 shadow-glass-2',
  3: 'bg-white/85 backdrop-blur-[24px] border border-white/50 shadow-glass-3',
  dark: 'bg-gray-900/75 backdrop-blur-[20px] border border-white/10 shadow-glass-dark text-white',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

export function GlassCard({
  children,
  level = 2,
  className,
  hover = false,
  padding = 'md',
  onClick,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-250',
        glassStyles[level],
        paddingStyles[padding],
        hover && 'hover:bg-white/80 hover:shadow-glass-3 hover:scale-[1.01] cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
