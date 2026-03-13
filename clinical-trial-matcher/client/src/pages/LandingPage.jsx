import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Zap, Stethoscope, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent-teal/5 blur-3xl" />
        <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-accent-cyan/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-accent-indigo/5 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-surface-border backdrop-blur-xl bg-dark-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-accent-teal/10">
            <Activity className="text-accent-teal h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-gradient">
            NeuroPrint Matcher
          </span>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/login')}
            className="btn-outline"
          >
            Log in
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="btn-glow flex items-center gap-2"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-3xl animate-fadeInUp">
          <div className="inline-flex items-center gap-2 badge-teal mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Clinical Intelligence
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            <span className="text-slate-100">Connecting Patients to</span><br />
            <span className="text-gradient-hero">Lifesaving Clinical Trials</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            AI-powered matching platform for healthcare professionals. Instantly find the right trial protocols for your patients with deep demographic and condition correlations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="btn-glow text-lg px-10 py-4 flex items-center justify-center gap-2"
            >
              Start Matching Now <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="btn-outline text-lg px-10 py-4"
            >
              Request Demo
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl px-4 stagger-children">
          {[
            {
              icon: Zap,
              title: "Automated AI Matching",
              desc: "Powered by Groq's insanely fast LLMs to determine patient eligibility instantly.",
              color: "text-accent-teal",
              bg: "bg-accent-teal/10"
            },
            {
              icon: ShieldCheck,
              title: "Secure & Compliant",
              desc: "Built robustly with privacy in mind. Ready for modern clinic infrastructure.",
              color: "text-accent-cyan",
              bg: "bg-accent-cyan/10"
            },
            {
              icon: Stethoscope,
              title: "Designed for Doctors",
              desc: "Optimized interfaces letting practitioners focus entirely on patient health outcomes.",
              color: "text-accent-indigo",
              bg: "bg-accent-indigo/10"
            }
          ].map((feature) => (
            <div
              key={feature.title}
              className="card-surface p-6 flex flex-col items-start text-left animate-fadeInUp group hover:border-accent-teal/20 transition-all duration-300"
            >
              <div className={`p-3 rounded-xl ${feature.bg} ${feature.color} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats row  */}
        <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl w-full animate-fadeInUp" style={{ animationDelay: '600ms' }}>
          {[
            { value: "10K+", label: "Trials Analyzed" },
            { value: "98%", label: "Matching Accuracy" },
            { value: "<2s", label: "Avg Response" }
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold text-gradient">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-surface-border text-center text-slate-500 text-sm bg-dark-900/60 backdrop-blur-xl">
        <p>&copy; 2026 NeuroPrint Matcher. All rights reserved.</p>
      </footer>
    </div>
  );
}
