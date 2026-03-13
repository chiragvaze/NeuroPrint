import { useEffect, useMemo, useState } from "react";
import { Fragment } from "react";
import { fetchAllTrials, importTrialJsonFile } from "../services/api";
import { Database, Filter, Upload, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from "lucide-react";

const DEFAULT_FILTERS = {
  condition: "",
  location: "",
  phase: ""
};

export default function TrialDatabasePage() {
  const [trials, setTrials] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [expandedTrialId, setExpandedTrialId] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTrials(activeFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const response = await fetchAllTrials(activeFilters);
      setTrials(response.trials || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load trial data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrials(DEFAULT_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phases = useMemo(() => {
    const values = new Set(trials.map((trial) => trial.phase).filter(Boolean));
    return Array.from(values).sort();
  }, [trials]);

  function onFilterChange(event) {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  async function applyFilters() {
    await loadTrials(filters);
  }

  async function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    await loadTrials(DEFAULT_FILTERS);
  }

  async function onImportDataset() {
    if (!uploadFile) {
      setError("Select a JSON file before importing.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await importTrialJsonFile(uploadFile);
      setMessage(`Imported ${response.count} trial records.`);
      setUploadFile(null);
      await loadTrials(filters);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to import trial JSON file.");
    } finally {
      setLoading(false);
    }
  }

  const phaseColor = (phase) => {
    if (!phase) return "badge-teal";
    if (phase.includes("1")) return "badge-indigo";
    if (phase.includes("2")) return "badge-amber";
    return "badge-teal";
  };

  return (
    <div className="space-y-6">
      {/* Header + Import */}
      <section className="card-surface p-6 animate-fadeInUp">
        <div className="flex items-start gap-3 mb-1">
          <div className="p-2 rounded-xl bg-accent-teal/10">
            <Database className="w-5 h-5 text-accent-teal" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Clinical Trial Database</h2>
            <p className="mt-1 text-sm text-slate-400">
              Import trial datasets and explore records with fast filters and full eligibility criteria views.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <input
            type="file"
            accept=".json"
            onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
            className="input-dark"
          />
          <button
            type="button"
            onClick={onImportDataset}
            disabled={loading}
            className="btn-glow flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Import JSON Dataset
          </button>
        </div>
      </section>

      {/* Filters */}
      <section className="card-surface p-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Filter className="w-5 h-5 text-accent-cyan" /> Filters
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input
            name="condition"
            value={filters.condition}
            onChange={onFilterChange}
            placeholder="Condition"
            className="input-dark"
          />
          <input
            name="location"
            value={filters.location}
            onChange={onFilterChange}
            placeholder="Location"
            className="input-dark"
          />
          <select
            name="phase"
            value={filters.phase}
            onChange={onFilterChange}
            className="input-dark"
          >
            <option value="">All Phases</option>
            {phases.map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={applyFilters}
            disabled={loading}
            className="btn-glow"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            disabled={loading}
            className="btn-outline"
          >
            Clear
          </button>
        </div>
      </section>

      {/* Trials Table */}
      <section className="card-surface p-6 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold text-slate-100 flex items-center justify-between">
          <span>Trials</span>
          {trials.length > 0 && (
            <span className="badge-teal text-xs">{trials.length} records</span>
          )}
        </h3>

        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <div className="w-4 h-4 border-2 border-accent-teal/30 border-t-accent-teal rounded-full animate-spin" />
            Loading trials...
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-xl border border-surface-border">
          <table className="min-w-full text-sm table-dark">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left">Trial ID</th>
                <th className="px-3 py-3 text-left">Title</th>
                <th className="px-3 py-3 text-left">Condition</th>
                <th className="px-3 py-3 text-left">Location</th>
                <th className="px-3 py-3 text-left">Phase</th>
                <th className="px-3 py-3 text-left">Age Range</th>
                <th className="px-3 py-3 text-left">Criteria</th>
              </tr>
            </thead>
            <tbody>
              {trials.map((trial) => {
                const isOpen = expandedTrialId === trial.trialId;

                return (
                  <Fragment key={trial.trialId}>
                    <tr>
                      <td className="px-3 py-3 font-semibold text-slate-200">{trial.trialId}</td>
                      <td className="px-3 py-3 text-slate-300 max-w-[200px] truncate">{trial.title}</td>
                      <td className="px-3 py-3">{trial.condition}</td>
                      <td className="px-3 py-3">{trial.location}</td>
                      <td className="px-3 py-3">
                        <span className={`badge ${phaseColor(trial.phase)}`}>{trial.phase}</span>
                      </td>
                      <td className="px-3 py-3 text-slate-300">
                        {trial.minAge} – {trial.maxAge}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedTrialId(isOpen ? "" : trial.trialId)}
                          className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1"
                        >
                          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {isOpen ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td className="px-3 py-3" colSpan={7}>
                          <div className="grid gap-4 rounded-xl p-5 md:grid-cols-2 animate-fadeInUp" style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                            <article>
                              <h4 className="font-semibold text-accent-teal text-sm">Inclusion Criteria</h4>
                              <p className="mt-2 whitespace-pre-wrap text-slate-300 text-sm leading-relaxed">{trial.inclusionCriteria}</p>
                            </article>
                            <article>
                              <h4 className="font-semibold text-accent-amber text-sm">Exclusion Criteria</h4>
                              <p className="mt-2 whitespace-pre-wrap text-slate-300 text-sm leading-relaxed">{trial.exclusionCriteria}</p>
                            </article>
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

        {!loading && trials.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">No trials found.</p>
        )}
        {message && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent-teal/30 bg-accent-teal/10 px-4 py-3 text-sm text-teal-300">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {message}
          </div>
        )}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
      </section>
    </div>
  );
}
