//a static Components. use Tailwind animate-pulse to simulates the background being loaded
export const BackgroundMockup = () => (
  <div className="absolute inset-0 z-0 p-12 opacity-20 pointer-events-none select-none overflow-hidden">
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="h-8 w-48 bg-slate-400 rounded animate-pulse" />
      <div className="grid grid-cols-3 gap-6">
        <div className="h-32 bg-slate-400 rounded-xl animate-pulse" />
        <div className="h-32 bg-slate-400 rounded-xl animate-pulse" />
        <div className="h-32 bg-slate-400 rounded-xl animate-pulse" />
      </div>
      <div className="h-64 bg-slate-400 rounded-xl w-full animate-pulse" />
    </div>
  </div>
);