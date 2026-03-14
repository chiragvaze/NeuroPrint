import { useEffect, useMemo, useState } from "react";
import { Fragment } from "react";
import { fetchAllTrials, importTrialJsonFile } from "../services/api";
import { Database, Filter, Upload, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Search, Globe, Beaker, ArrowRight, Sparkles, FileJson, LayoutGrid, List, Eye } from "lucide-react";

const DEFAULT_FILTERS = { condition: "", location: "", phase: "" };

export default function TrialDatabasePage() {
  const [trials, setTrials] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [expandedTrialId, setExpandedTrialId] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("table"); // table or grid

  async function loadTrials(active = filters) {
    setLoading(true); setError("");
    try {
      const res = await fetchAllTrials(active);
      setTrials(res.trials || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load trial data.");
    } finally { setLoading(false); }
  }

  useEffect(() => { loadTrials(DEFAULT_FILTERS); }, []);

  const phases = useMemo(() => Array.from(new Set(trials.map((t) => t.phase).filter(Boolean))).sort(), [trials]);

  function onFilterChange(e) {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function applyFilters() { await loadTrials(filters); }
  async function clearFilters() { setFilters(DEFAULT_FILTERS); await loadTrials(DEFAULT_FILTERS); }

  async function onImportDataset() {
    if (!uploadFile) { setError("Select a JSON file before importing."); return; }
    setLoading(true); setError(""); setMessage("");
    try {
      const res = await importTrialJsonFile(uploadFile);
      setMessage(`Imported ${res.count} trial records successfully.`);
      setUploadFile(null);
      await loadTrials(filters);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to import trial JSON file.");
    } finally { setLoading(false); }
  }

  const phaseColor = (phase) => {
    if (!phase) return { bg: "rgba(20,184,166,0.08)", text: "#5eead4", border: "rgba(20,184,166,0.12)" };
    if (phase.includes("1")) return { bg: "rgba(139,92,246,0.08)", text: "#c4b5fd", border: "rgba(139,92,246,0.12)" };
    if (phase.includes("2")) return { bg: "rgba(245,158,11,0.08)", text: "#fbbf24", border: "rgba(245,158,11,0.12)" };
    if (phase.includes("3")) return { bg: "rgba(99,102,241,0.08)", text: "#a5b4fc", border: "rgba(99,102,241,0.12)" };
    return { bg: "rgba(20,184,166,0.08)", text: "#5eead4", border: "rgba(20,184,166,0.12)" };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ═══ Banner ═══ */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04), rgba(20,184,166,0.03))', border: '1px solid rgba(99,102,241,0.08)' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Trial Repository</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Clinical Trial Database</h2>
          <p className="text-sm text-slate-400 mt-1">Import, explore, and filter trial datasets with full eligibility criteria.</p>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-indigo-400/[0.03] blur-3xl pointer-events-none" />
      </div>

      {/* ═══ Import + Filters Row ═══ */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Import */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-3">Import Dataset</p>
          <label className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all hover:border-white/[0.1]"
                 style={{ background: 'rgba(6,10,19,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <input type="file" accept=".json" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="hidden" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.15)' }}>
              <FileJson className="w-3.5 h-3.5" /> Browse
            </span>
            <span className="text-sm text-slate-400 truncate">{uploadFile ? uploadFile.name : "Select .json file"}</span>
          </label>
          <button type="button" onClick={onImportDataset} disabled={loading || !uploadFile}
            className="mt-3 btn-glow w-full flex items-center justify-center gap-2 text-sm">
            <Upload className="w-4 h-4" /> Import Records
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-3">Filters</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { name: "condition", placeholder: "Diabetes", label: "Condition", icon: Search },
              { name: "location", placeholder: "Mumbai", label: "Location", icon: Globe },
            ].map((f) => (
              <div key={f.name}>
                <div className="relative">
                  <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input name={f.name} value={filters[f.name]} onChange={onFilterChange} placeholder={f.placeholder}
                    className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm bg-white/[0.02] border border-white/[0.05] text-slate-200 placeholder:text-slate-400 outline-none focus:border-teal-500/30 transition-all" />
                </div>
              </div>
            ))}
            <div>
              <div className="relative">
                <Beaker className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <select name="phase" value={filters.phase} onChange={onFilterChange}
                  className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm bg-white/[0.02] border border-white/[0.05] text-slate-200 outline-none focus:border-teal-500/30 transition-all appearance-none">
                  <option value="" style={{ background: '#0c1222' }}>All Phases</option>
                  {phases.map((p) => <option key={p} value={p} style={{ background: '#0c1222' }}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={applyFilters} disabled={loading} className="btn-glow text-sm px-5">Apply</button>
            <button type="button" onClick={clearFilters} disabled={loading} className="btn-outline text-sm px-5">Clear</button>
          </div>
        </div>
      </div>

      {/* ═══ Results Header ═══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-[13px] font-semibold text-slate-200">Trial Records</p>
          {trials.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-teal-400 bg-teal-400/10 border border-teal-400/15">{trials.length}</span>
          )}
          {loading && <div className="w-3.5 h-3.5 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />}
        </div>
        <div className="flex rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          {[
            { id: "table", icon: List },
            { id: "grid", icon: LayoutGrid }
          ].map((v) => (
            <button key={v.id} onClick={() => setViewMode(v.id)}
              className={`p-2 rounded-md transition-all ${viewMode === v.id ? "text-teal-400 bg-teal-400/10" : "text-slate-300 hover:text-slate-400"}`}>
              <v.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Grid View ═══ */}
      {viewMode === "grid" && trials.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {trials.map((trial) => {
            const pc = phaseColor(trial.phase);
            const isOpen = expandedTrialId === trial.trialId;
            return (
              <div key={trial.trialId} className="rounded-2xl p-5 group transition-all duration-200 hover:border-white/[0.08]"
                   style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-slate-400">{trial.trialId}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: pc.bg, color: pc.text, border: `1px solid ${pc.border}` }}>{trial.phase}</span>
                </div>
                <h4 className="text-[13px] font-semibold text-slate-200 line-clamp-2 mb-2">{trial.title}</h4>
                <div className="space-y-1.5 text-[12px] text-slate-400">
                  <p><span className="text-slate-300">Condition:</span> {trial.condition}</p>
                  <p><span className="text-slate-300">Location:</span> {trial.location}</p>
                  <p><span className="text-slate-300">Age:</span> {trial.minAge} – {trial.maxAge}</p>
                </div>
                <button type="button" onClick={() => setExpandedTrialId(isOpen ? "" : trial.trialId)}
                  className="mt-3 w-full btn-outline text-[11px] py-2 flex items-center justify-center gap-1.5">
                  <Eye className="w-3 h-3" /> {isOpen ? "Hide Criteria" : "View Criteria"}
                </button>
                {isOpen && (
                  <div className="mt-3 space-y-2 text-[12px] animate-fadeIn">
                    <div className="rounded-lg p-3" style={{ background: 'rgba(6,10,19,0.5)', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-1">Inclusion</p>
                      <p className="text-slate-400 whitespace-pre-wrap leading-relaxed">{trial.inclusionCriteria}</p>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: 'rgba(6,10,19,0.5)', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">Exclusion</p>
                      <p className="text-slate-400 whitespace-pre-wrap leading-relaxed">{trial.exclusionCriteria}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Table View ═══ */}
      {viewMode === "table" && (
        <div className="rounded-2xl p-1" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full text-sm table-dark">
              <thead>
                <tr>
                  <th>Trial ID</th>
                  <th>Title</th>
                  <th>Condition</th>
                  <th>Location</th>
                  <th>Phase</th>
                  <th>Age Range</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trials.map((trial) => {
                  const isOpen = expandedTrialId === trial.trialId;
                  const pc = phaseColor(trial.phase);
                  return (
                    <Fragment key={trial.trialId}>
                      <tr>
                        <td className="font-semibold text-slate-300">{trial.trialId}</td>
                        <td className="text-slate-400 max-w-[200px] truncate">{trial.title}</td>
                        <td>{trial.condition}</td>
                        <td>{trial.location}</td>
                        <td>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: pc.bg, color: pc.text, border: `1px solid ${pc.border}` }}>{trial.phase}</span>
                        </td>
                        <td className="tabular-nums text-slate-400">{trial.minAge} – {trial.maxAge}</td>
                        <td>
                          <button type="button" onClick={() => setExpandedTrialId(isOpen ? "" : trial.trialId)}
                            className="btn-outline py-1.5 px-3 text-[11px] flex items-center gap-1">
                            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {isOpen ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={7} className="!p-0">
                            <div className="grid gap-4 p-5 md:grid-cols-2 animate-fadeIn" style={{ background: 'rgba(6,10,19,0.4)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-2 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Inclusion Criteria
                                </p>
                                <p className="whitespace-pre-wrap text-slate-400 text-sm leading-relaxed">{trial.inclusionCriteria}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5" /> Exclusion Criteria
                                </p>
                                <p className="whitespace-pre-wrap text-slate-400 text-sm leading-relaxed">{trial.exclusionCriteria}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && trials.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(10,15,28,0.6)', border: '1px dashed rgba(255,255,255,0.04)' }}>
          <Database className="w-12 h-12 text-slate-400/40 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-400">No trials found</p>
          <p className="text-xs text-slate-300 mt-1">Import a JSON dataset to populate the trial database.</p>
        </div>
      )}

      {/* Status */}
      {message && (
        <div className="flex items-center gap-2.5 rounded-xl px-5 py-3.5 text-sm text-teal-300 animate-fadeIn"
             style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.12)' }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl px-5 py-3.5 text-sm text-red-300 animate-fadeIn"
             style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
