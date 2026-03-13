import { Activity, LayoutDashboard, Upload, Database, BarChart3, LogOut } from "lucide-react";

export default function AppLayout({ children, activePage, onNavigate, user, onLogout }) {
  const navItems = [
    { id: "results", label: "Match Dashboard", icon: BarChart3 },
    { id: "patients", label: "Patient Upload", icon: Upload },
    { id: "trials", label: "Trial Database", icon: Database }
  ];

  return (
    <div className="min-h-screen bg-app-gradient flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[260px] flex-col border-r border-surface-border bg-dark-900/80 backdrop-blur-2xl">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent-teal/10">
              <Activity className="text-accent-teal h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent-teal">Neuroprint</p>
              <p className="text-sm font-semibold text-slate-200">Trial Matcher</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-accent-teal/10 text-accent-teal shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-dark-700/50"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-accent-teal" : ""}`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulseGlow" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        {user && (
          <div className="px-4 py-4 border-t border-surface-border">
            <div className="card-surface px-4 py-3 rounded-xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Signed In</p>
              <p className="text-sm font-medium text-slate-200 mt-0.5 truncate">{user.name}</p>
              <span className="badge-teal text-[10px] mt-1.5">
                {user.role === "clinical_researcher" ? "Researcher" : "Doctor"}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 btn-outline py-2.5 text-sm"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header (mobile + desktop) */}
        <header className="border-b border-surface-border bg-dark-900/60 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile brand */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="p-1.5 rounded-lg bg-accent-teal/10">
                <Activity className="text-accent-teal h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-gradient">NeuroPrint</span>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-slate-100">
                {navItems.find((n) => n.id === activePage)?.label || "Dashboard"}
              </h1>
            </div>
            <span className="badge-teal hidden sm:inline-flex">
              AI + Rules + Explainability
            </span>
          </div>

          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-1 px-4 pb-3 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-accent-teal/10 text-accent-teal"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="flex-1 px-6 py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
