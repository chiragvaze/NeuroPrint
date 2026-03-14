import { useState } from "react";
import { LayoutDashboard, Upload, Database, BarChart3, LogOut, Settings, Bell, HelpCircle, Search, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

export default function AppLayout({ children, activePage, onNavigate, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: "results", label: "Match Dashboard", icon: BarChart3 },
    { id: "patients", label: "Patient Upload", icon: Upload },
    { id: "trials", label: "Trial Database", icon: Database }
  ];

  const sideWidth = collapsed ? "w-[72px]" : "w-[260px]";

  return (
    <div className="min-h-screen bg-[#060a13] flex font-sans">
      {/* ═══ Mobile overlay ═══ */}
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* ═══ Sidebar ═══ */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ease-out ${sideWidth}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        border-r border-white/[0.04]`}
        style={{ background: 'linear-gradient(180deg, rgba(8,12,22,0.98) 0%, rgba(6,10,19,0.99) 100%)' }}>

        {/* Brand */}
        <div className={`flex items-center ${collapsed ? "justify-center px-2" : "px-5"} h-16 border-b border-white/[0.04] flex-shrink-0`}>
          <div className="relative flex items-center gap-2.5">
            <img src="/logo.png" alt="Clinical Trial Matcher" className="w-9 h-9 rounded-lg object-contain flex-shrink-0" />
            {!collapsed && (
              <div className="animate-fadeIn">
                <p className="text-[13px] font-bold text-teal-400 tracking-tight leading-none">Clinical Trial</p>
                <p className="text-[10px] text-slate-300 font-medium">Matcher v2.0</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className={`flex-1 ${collapsed ? "px-2" : "px-3"} py-4 space-y-1 overflow-y-auto`}>
          {!collapsed && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 px-3 mb-2">Navigation</p>}
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button key={item.id} type="button" onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                className={`group w-full flex items-center gap-3 rounded-xl transition-all duration-200 relative
                  ${collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}
                  ${isActive ? "text-teal-400" : "text-slate-400 hover:text-slate-300"}`}>
                {isActive && (
                  <div className="absolute inset-0 rounded-xl"
                       style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(20,184,166,0.02))', border: '1px solid rgba(20,184,166,0.1)' }} />
                )}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-teal-400" style={{ boxShadow: '0 0 12px rgba(20,184,166,0.6)' }} />}
                <item.icon className="w-[18px] h-[18px] relative z-10 flex-shrink-0" />
                {!collapsed && <span className="relative z-10 text-[13px] font-medium">{item.label}</span>}
                {isActive && !collapsed && <div className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-teal-400" style={{ boxShadow: '0 0 8px rgba(20,184,166,0.6)' }} />}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:flex justify-center py-3 border-t border-white/[0.04]">
          <button onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-slate-300 hover:text-slate-400 hover:bg-white/[0.03] transition-all">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User */}
        {user && !collapsed && (
          <div className="px-3 py-3 border-t border-white/[0.04] flex-shrink-0">
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl" style={{ background: 'rgba(6,10,19,0.6)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                   style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(99,102,241,0.1))', color: '#5eead4', border: '1px solid rgba(20,184,166,0.15)' }}>
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-300 font-medium">{user.role === "clinical_researcher" ? "Researcher" : "Doctor"}</p>
              </div>
            </div>
            <button type="button" onClick={onLogout}
              className="mt-2 w-full flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-red-400 py-2 rounded-lg hover:bg-red-400/5 transition-all">
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* ═══ Main area ═══ */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b border-white/[0.04]"
                style={{ background: 'rgba(6,10,19,0.8)', backdropFilter: 'blur(20px) saturate(180%)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-white/[0.03]">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <h1 className="text-[15px] font-semibold text-slate-100">
                {navItems.find((n) => n.id === activePage)?.label || "Dashboard"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 rounded-xl px-3 py-2"
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <Search className="w-3.5 h-3.5 text-slate-300" />
              <input placeholder="Search..." className="bg-transparent text-sm text-slate-300 placeholder:text-slate-300 outline-none w-40" />
              <kbd className="text-[9px] font-sans font-semibold text-slate-300 bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded">⌘K</kbd>
            </div>

            <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-300 hover:bg-white/[0.03] transition-all">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-400" style={{ boxShadow: '0 0 6px rgba(20,184,166,0.5)' }} />
            </button>
            <button className="p-2 rounded-xl text-slate-400 hover:text-slate-300 hover:bg-white/[0.03] transition-all">
              <HelpCircle className="w-[18px] h-[18px]" />
            </button>
            <button className="p-2 rounded-xl text-slate-400 hover:text-slate-300 hover:bg-white/[0.03] transition-all">
              <Settings className="w-[18px] h-[18px]" />
            </button>

            {/* User avatar (mobile) */}
            {user && (
              <div className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                   style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(99,102,241,0.1))', color: '#5eead4', border: '1px solid rgba(20,184,166,0.15)' }}>
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
