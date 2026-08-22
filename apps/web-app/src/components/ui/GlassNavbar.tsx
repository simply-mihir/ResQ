import { cn } from '@/lib/utils';

interface NavbarProps {
  variant?: 'transparent' | 'solid';
  children: React.ReactNode;
}

export function GlassNavbar({ variant = 'transparent', children }: NavbarProps) {
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
        {children}
      </div>
    </nav>
  );
}
