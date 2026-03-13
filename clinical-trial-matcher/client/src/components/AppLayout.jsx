export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold text-slate-900">Clinical Trial Matcher</h1>
          <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
            AI Eligibility Engine
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
