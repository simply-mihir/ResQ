import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NavbarProps {
  variant?: 'transparent' | 'solid';
  children: React.ReactNode;
  backUrl?: string;
}

export function GlassNavbar({ variant = 'transparent', children, backUrl }: NavbarProps) {
  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-[20] px-4 py-3',
        'transition-all duration-300',
        variant === 'transparent' && [
          'bg-white/50 backdrop-blur-[16px]',
          'border-b border-white/30',
        ],
        variant === 'solid' && [
          'bg-white shadow-sm',
        ]
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {backUrl && (
          <Link href={backUrl} className="mr-3 text-neutral-600 hover:text-neutral-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}
        {children}
      </div>
    </nav>
  );
}
