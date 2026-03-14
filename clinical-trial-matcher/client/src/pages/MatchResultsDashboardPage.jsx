import { useMemo, useState } from "react";
import {
  fetchAllTrials,
  fetchMatchExplanation,
  fetchRecommendations
} from "../services/api";
import RecommendedTrialsList from "../components/RecommendedTrialsList";
import MatchConfidenceChart from "../components/MatchConfidenceChart";
import TrialRankingChart from "../components/TrialRankingChart";
import EligibilityDistributionChart from "../components/EligibilityDistributionChart";

import PatientProfileCard from "../components/PatientProfileCard";
import { BarChart3, MapPin, Zap, TrendingUp, AlertCircle, Target, Activity, Brain, ArrowRight, Sparkles, Users, Clock } from "lucide-react";

const DEFAULT_PATIENT = {
  patientId: "", age: "", gender: "", conditions: "", medications: "", location: ""
};

function toList(value) {
  return String(value || "").split(",").map((s) => s.trim()).filter(Boolean);
}
function normalizePatient(f) {
  return { patientId: f.patientId, age: Number(f.age), gender: f.gender, conditions: toList(f.conditions), medications: toList(f.medications), location: f.location };
}

/* ── SVG Score Ring ── */
function ScoreRing({ score, size = 120, stroke = 8, label }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#14b8a6" : score >= 60 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="score-ring -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(148,163,184,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color}40)` }} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-3xl font-black text-slate-100 tabular-nums">{score}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</span>
      </div>
    </div>
  );
}

/* ── Progress Bar ── */
function ProgressBar({ value, max = 100, color = "teal" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = { teal: "#14b8a6", cyan: "#22d3ee", indigo: "#6366f1", amber: "#f59e0b" };
  const c = colors[color] || colors.teal;
  return (
    <div className="h-1.5 rounded-full w-full" style={{ background: 'rgba(148,163,184,0.06)' }}>
      <div className="h-full rounded-full transition-all duration-1000 ease-out"
           style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${c}, ${c}aa)`, boxShadow: `0 0 8px ${c}30` }} />
    </div>
  );
}

export default function MatchResultsDashboardPage() {
  const [patientForm, setPatientForm] = useState(DEFAULT_PATIENT);
  const [geoFilter, setGeoFilter] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [trialsCache, setTrialsCache] = useState([]);
  const [selectedTrialId, setSelectedTrialId] = useState("");
  const [explanationByTrial, setExplanationByTrial] = useState({});
  const [loading, setLoading] = useState(false);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [error, setError] = useState("");

  const bestScore = useMemo(() => recommendations.length ? recommendations[0].score : 0, [recommendations]);
  const avgScore = useMemo(() => {
    if (!recommendations.length) return 0;
    return Math.round(recommendations.reduce((s, r) => s + r.score, 0) / recommendations.length);
  }, [recommendations]);
  const eligibleCount = useMemo(() => recommendations.filter((r) => r.score >= 70).length, [recommendations]);

  const selectedTrial = useMemo(() => trialsCache.find((t) => t.trialId === selectedTrialId) || null, [selectedTrialId, trialsCache]);
  const selectedMatchingResult = useMemo(() => {
    const item = recommendations.find((r) => r.trialId === selectedTrialId);
    if (!item) return null;
    return { eligible: item.score >= 70, finalScore: item.score / 100, reasons: ["Age within range", "Required condition present", "No exclusion conditions detected"] };
  }, [recommendations, selectedTrialId]);

  function onPatientChange(e) {
    setPatientForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function generateRecommendations() {
    setLoading(true); setError("");
    try {
      const patient = normalizePatient(patientForm);
      const res = await fetchAllTrials({});
      let trials = res.trials || [];
      if (geoFilter.trim()) {
        const q = geoFilter.toLowerCase();
        trials = trials.filter((t) => String(t.location || "").toLowerCase().includes(q));
      }
      if (!trials.length) throw new Error("No trials match the selected location filter.");
      const recRes = await fetchRecommendations({ patient, trials });
      setTrialsCache(trials);
      setRecommendations(recRes.recommendations || []);
      setSelectedTrialId(""); setExplanationByTrial({});
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to generate recommendations.");
    } finally {
      setLoading(false);
    }
  }

  async function loadExplanation(trialId) {
    setSelectedTrialId(trialId);
    if (explanationByTrial[trialId]) return;
    setExplanationLoading(true); setError("");
    try {
      const trial = trialsCache.find((t) => t.trialId === trialId);
      const match = recommendations.find((r) => r.trialId === trialId);
      if (!trial || !match) throw new Error("Unable to find trial details.");
      const res = await fetchMatchExplanation({
        patient: normalizePatient(patientForm), trial,
        matchingResult: { eligible: match.score >= 70, finalScore: match.score / 100, reasons: ["Age within range", "Required condition present", "No exclusion conditions detected"] }
      });
      setExplanationByTrial((prev) => ({ ...prev, [trialId]: res.explanation }));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to generate explanation.");
    } finally {
      setExplanationLoading(false);
    }
  }

  const hasResults = recommendations.length > 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ═══ Welcome Banner ═══ */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.06), rgba(99,102,241,0.04), rgba(139,92,246,0.03))', border: '1px solid rgba(20,184,166,0.08)' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider">AI-Powered Matching</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Match Results Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">Enter patient data below, generate AI recommendations, then explore match explanations with our conversational AI.</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-teal-400/[0.03] blur-3xl pointer-events-none" />
      </div>

      {/* ═══ Patient Input Card ═══ */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-4">Patient Information</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "patientId", placeholder: "PAT-3001", label: "Patient ID" },
            { name: "age", placeholder: "45", label: "Age", type: "number" },
            { name: "gender", placeholder: "Male / Female", label: "Gender" },
            { name: "location", placeholder: "Mumbai, India", label: "Location" },
            { name: "conditions", placeholder: "Diabetes, Hypertension", label: "Conditions", span: "sm:col-span-2 lg:col-span-1" },
            { name: "medications", placeholder: "Metformin, Insulin", label: "Medications", span: "sm:col-span-2 lg:col-span-1" },
          ].map((f) => (
            <div key={f.name} className={f.span || ""}>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-300 mb-1.5">{f.label}</label>
              <input name={f.name} type={f.type || "text"} placeholder={f.placeholder} value={patientForm[f.name]} onChange={onPatientChange}
                className="w-full rounded-xl px-4 py-2.5 text-sm bg-white/[0.02] border border-white/[0.05] text-slate-200 placeholder:text-slate-400 outline-none focus:border-teal-500/30 focus:ring-2 focus:ring-teal-500/10 transition-all" />
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-300 mb-1.5">Geographic Filter</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input value={geoFilter} onChange={(e) => setGeoFilter(e.target.value)} placeholder="Filter by location"
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm bg-white/[0.02] border border-white/[0.05] text-slate-200 placeholder:text-slate-400 outline-none focus:border-teal-500/30 focus:ring-2 focus:ring-teal-500/10 transition-all" />
            </div>
          </div>
          <button type="button" onClick={generateRecommendations} disabled={loading}
            className="btn-glow flex items-center gap-2 whitespace-nowrap">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Generating...</>
            ) : (
              <><Zap className="w-4 h-4" /> Generate Matches <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>

      {/* ═══ Metrics Row with Score Rings ═══ */}
      {hasResults && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Score Ring */}
          <div className="col-span-2 lg:col-span-1 rounded-2xl p-6 flex items-center justify-center relative"
               style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <ScoreRing score={bestScore} label="best" />
          </div>

          {/* Metric Cards */}
          {[
            { icon: Target, label: "Average Score", value: `${avgScore}%`, color: "text-cyan-400", progress: avgScore, pColor: "cyan" },
            { icon: Activity, label: "Total Matches", value: recommendations.length, color: "text-indigo-400", progress: Math.min(100, recommendations.length * 10), pColor: "indigo" },
            { icon: Brain, label: "Eligible Trials", value: eligibleCount, color: "text-teal-400", progress: recommendations.length ? (eligibleCount / recommendations.length) * 100 : 0, pColor: "teal" }
          ].map((m) => (
            <div key={m.label} className="rounded-2xl p-5 group hover:border-white/[0.08] transition-all"
                 style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center justify-between mb-3">
                <m.icon className={`w-4 h-4 ${m.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{m.label}</span>
              </div>
              <p className={`text-2xl font-black ${m.color} mb-3`}>{m.value}</p>
              <ProgressBar value={m.progress} color={m.pColor} />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3.5 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}



      <PatientProfileCard patientId={patientForm.patientId} />

      {/* ═══ Charts + Trial List ═══ */}
      <div className="grid gap-6 xl:grid-cols-2">
        <RecommendedTrialsList
          recommendations={recommendations} selectedTrialId={selectedTrialId}
          onSelectTrial={loadExplanation} explanationByTrial={explanationByTrial}
          explanationLoading={explanationLoading}
        />
        <MatchConfidenceChart recommendations={recommendations} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <TrialRankingChart recommendations={recommendations} />
        <EligibilityDistributionChart recommendations={recommendations} />
      </div>
    </div>
  );
}
