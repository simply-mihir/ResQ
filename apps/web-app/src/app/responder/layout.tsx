export default function ResponderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-primary-900 text-white p-4 shadow-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
          </div>
          <h1 className="font-semibold text-lg">First Responder</h1>
        </div>
        <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Online
        </div>
      </header>
      <main className="flex-1 max-w-xl mx-auto w-full relative">
        {children}
      </main>
    </div>
  );
}
