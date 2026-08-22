interface GlassBackgroundProps {
  variant?: 'default' | 'emergency' | 'hospital' | 'calm';
  children: React.ReactNode;
}

const backgrounds = {
  default: (
    <>
      {/* Primary gradient orb */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary-200/40 blur-[120px]" />
      {/* Secondary gradient orb */}
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-200/30 blur-[100px]" />
      {/* Accent */}
      <div className="fixed top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-violet-200/20 blur-[80px]" />
    </>
  ),
  emergency: (
    <>
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-red-200/30 blur-[120px]" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-200/20 blur-[100px]" />
      <div className="fixed top-[50%] left-[20%] w-[400px] h-[400px] rounded-full bg-red-100/25 blur-[90px]" />
    </>
  ),
  hospital: (
    <>
      <div className="fixed top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-200/30 blur-[100px]" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-200/20 blur-[80px]" />
      <div className="fixed top-[30%] left-[50%] w-[350px] h-[350px] rounded-full bg-teal-100/20 blur-[90px]" />
    </>
  ),
  calm: (
    <>
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-green-100/30 blur-[120px]" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-100/20 blur-[100px]" />
    </>
  ),
};

export function GlassBackground({ variant = 'default', children }: GlassBackgroundProps) {
  return (
    <div className="relative min-h-screen bg-neutral-50 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="pointer-events-none" aria-hidden="true">
        {backgrounds[variant]}
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
