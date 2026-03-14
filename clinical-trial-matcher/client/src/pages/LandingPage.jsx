import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Zap, Stethoscope, ArrowRight, Sparkles, Brain, Globe, TrendingUp, Users, ChevronRight } from 'lucide-react';

/* Animated counter hook */
function useCounter(end, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!end) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
}

/* Floating orb component */
function FloatingOrb({ className, delay = 0 }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-float ${className}`}
      style={{ animationDelay: `${delay}ms`, animationDuration: '6s' }}
    />
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const trials = useCounter(10847, 2500);
  const accuracy = useCounter(98, 2000);

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col font-sans relative overflow-hidden">
      {/* ═══ Ambient Orbs ═══ */}
      <FloatingOrb className="h-[600px] w-[600px] bg-accent-teal/[0.04] -top-48 -left-48" delay={0} />
      <FloatingOrb className="h-[500px] w-[500px] bg-accent-indigo/[0.04] top-32 -right-32" delay={1500} />
      <FloatingOrb className="h-[400px] w-[400px] bg-accent-violet/[0.03] bottom-20 left-1/3" delay={3000} />

      {/* ═══ Grid Overlay ═══ */}
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />

      {/* ═══ Navbar ═══ */}
      <header className="relative z-20 px-8 py-5 flex items-center justify-between border-b border-surface-border backdrop-blur-2xl bg-dark-900/50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Clinical Trial Matcher" className="w-10 h-10 object-contain" />
          <div>
            <span className="text-lg font-bold text-gradient tracking-tight">Clinical Trial Matcher</span>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 -mt-0.5">AI-Powered Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-ghost text-slate-400 hover:text-slate-200">
            Log in
          </button>
          <button onClick={() => navigate('/login')} className="btn-glow flex items-center gap-2 text-sm">
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ═══ Hero Section ═══ */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="max-w-4xl animate-fadeInUp">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold mb-8 animate-shimmer"
               style={{ background: 'rgba(20, 184, 166, 0.06)', border: '1px solid rgba(20, 184, 166, 0.15)', color: '#5eead4' }}>
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Clinical Intelligence Platform
            <ChevronRight className="w-3.5 h-3.5" />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-8">
            <span className="text-white/90">Connecting Patients</span>
            <br />
            <span className="text-white/90">to </span>
            <span className="text-gradient-hero">Lifesaving Trials</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-14 max-w-2xl mx-auto leading-relaxed">
            Next-generation AI matching engine for healthcare professionals. Instantly identify optimal trial protocols with deep semantic analysis and explainable reasoning.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/login')} className="btn-glow text-base px-10 py-4 flex items-center justify-center gap-2.5 group">
              Start Matching Now 
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={() => navigate('/login')} className="btn-outline text-base px-10 py-4 group flex items-center justify-center gap-2">
              <Globe className="w-4 h-4" /> Request Demo
            </button>
          </div>
        </div>

        {/* ═══ Trusted By Bar ═══ */}
        <div className="mt-20 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-5 font-semibold">Trusted by leading institutions</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-30">
            {["AIIMS Delhi", "Mayo Clinic", "Johns Hopkins", "Stanford Medicine", "TATA Memorial"].map((name) => (
              <span key={name} className="text-sm font-semibold text-slate-300 tracking-wide">{name}</span>
            ))}
          </div>
        </div>

        {/* ═══ Features ═══ */}
        <div className="grid md:grid-cols-3 gap-5 mt-24 max-w-5xl w-full px-4 stagger-children">
          {[
            {
              icon: Zap,
              title: "Automated AI Matching",
              desc: "Powered by Groq's insanely fast LLMs to determine patient eligibility in milliseconds, not minutes.",
              accent: "teal",
              badge: "Core Engine"
            },
            {
              icon: ShieldCheck,
              title: "Secure & Compliant",
              desc: "Zero PII exposure. Built with anonymization guardrails and production-grade authentication from day one.",
              accent: "cyan",
              badge: "Enterprise"
            },
            {
              icon: Brain,
              title: "Explainable AI",
              desc: "Every match comes with a full reasoning chain. Understand why each trial was recommended via natural language.",
              accent: "indigo",
              badge: "XAI"
            }
          ].map((feature) => (
            <div key={feature.title} className="card-glow animate-fadeInUp group">
              <div className="card-glow-inner p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-accent-${feature.accent}/10 text-accent-${feature.accent} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                       style={{ 
                         background: `rgba(${feature.accent === 'teal' ? '20,184,166' : feature.accent === 'cyan' ? '34,211,238' : '99,102,241'}, 0.1)`,
                         color: feature.accent === 'teal' ? '#14b8a6' : feature.accent === 'cyan' ? '#22d3ee' : '#6366f1'
                       }}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <span className={`badge badge-${feature.accent}`}>{feature.badge}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ Stats ═══ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-24 max-w-4xl w-full animate-fadeInUp" style={{ animationDelay: '600ms' }}>
          {[
            { icon: TrendingUp, value: `${trials.toLocaleString()}+`, label: "Trials Analyzed", color: "text-accent-teal" },
            { icon: Zap, value: `${accuracy}%`, label: "Match Accuracy", color: "text-accent-cyan" },
            { icon: Users, value: "5K+", label: "Active Clinicians", color: "text-accent-indigo" },
            { icon: Globe, value: "<1.5s", label: "Avg Response", color: "text-accent-violet" }
          ].map((stat) => (
            <div key={stat.label} className="metric-card text-center group">
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity`} />
              <p className={`text-3xl md:text-4xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="metric-label">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ═══ How it Works ═══ */}
        <div className="mt-28 max-w-4xl w-full animate-fadeInUp" style={{ animationDelay: '700ms' }}>
          <h2 className="text-3xl font-bold text-center text-slate-100 mb-3">How It Works</h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">Three simple steps to find the perfect clinical trial match for your patients.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Upload Patient Data", desc: "Import anonymized patient records via CSV, JSON, or manual entry.", icon: Users },
              { step: "02", title: "AI Analyzes & Matches", desc: "Our engine scores eligibility using rules, embeddings, and semantic analysis.", icon: Brain },
              { step: "03", title: "Review & Explain", desc: "Get ranked trials with explainable AI reasoning for every recommendation.", icon: Stethoscope }
            ].map((item, i) => (
              <div key={item.step} className="relative">
                <div className="card-surface p-6 relative overflow-hidden group hover:border-accent-teal/15 transition-all duration-300">
                  <div className="absolute top-3 right-3 text-[64px] font-black leading-none text-white/[0.02] select-none group-hover:text-accent-teal/[0.04] transition-colors">
                    {item.step}
                  </div>
                  <div className="p-2.5 rounded-xl bg-accent-teal/8 text-accent-teal w-fit mb-4">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-100 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ CTA Banner ═══ */}
        <div className="mt-28 max-w-4xl w-full animate-fadeInUp" style={{ animationDelay: '800ms' }}>
          <div className="card-glow">
            <div className="card-glow-inner p-10 md:p-14 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">Ready to Transform Clinical Matching?</h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">Join thousands of clinicians using AI-powered trial matching to improve patient outcomes.</p>
              <button onClick={() => navigate('/login')} className="btn-glow text-base px-10 py-4 group inline-flex items-center gap-2.5">
                Get Started Free <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="relative z-10 border-t border-surface-border bg-dark-900/60 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-8 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="Clinical Trial Matcher" className="w-8 h-8 object-contain" />
              <span className="font-bold text-gradient">Clinical Trial Matcher</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">AI-powered clinical trial matching for the next generation of healthcare.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="hover:text-slate-300 cursor-pointer transition-colors">Trial Database</li>
              <li className="hover:text-slate-300 cursor-pointer transition-colors">Patient Upload</li>
              <li className="hover:text-slate-300 cursor-pointer transition-colors">AI Matching Engine</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-slate-300 cursor-pointer transition-colors">HIPAA Compliance</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-border py-5 text-center text-xs text-slate-300">
          &copy; 2026 Clinical Trial Matcher. All rights reserved. Built with ❤️ for clinical research.
        </div>
      </footer>
    </div>
  );
}
