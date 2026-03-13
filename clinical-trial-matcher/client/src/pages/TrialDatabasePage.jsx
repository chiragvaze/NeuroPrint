import { useEffect, useMemo, useState } from "react";
import { Fragment } from "react";
import { fetchAllTrials, importTrialJsonFile } from "../services/api";

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

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Clinical Trial Database</h2>
        <p className="mt-2 text-sm text-slate-600">
          Import trial datasets and explore eligibility criteria with condition, location, and phase filters.
        </p>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="file"
            accept=".json"
            onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={onImportDataset}
            disabled={loading}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            Import JSON Dataset
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Filters</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input
            name="condition"
            value={filters.condition}
            onChange={onFilterChange}
            placeholder="Condition"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            name="location"
            value={filters.location}
            onChange={onFilterChange}
            placeholder="Location"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <select
            name="phase"
            value={filters.phase}
            onChange={onFilterChange}
            className="rounded-lg border border-slate-300 px-3 py-2"
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
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Clear
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Trials</h3>

        {loading ? <p className="mt-4 text-sm text-slate-600">Loading trials...</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="px-3 py-2">trialId</th>
                <th className="px-3 py-2">title</th>
                <th className="px-3 py-2">condition</th>
                <th className="px-3 py-2">location</th>
                <th className="px-3 py-2">phase</th>
                <th className="px-3 py-2">age range</th>
                <th className="px-3 py-2">criteria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trials.map((trial) => {
                const isOpen = expandedTrialId === trial.trialId;

                return (
                  <Fragment key={trial.trialId}>
                    <tr key={trial.trialId}>
                      <td className="px-3 py-2">{trial.trialId}</td>
                      <td className="px-3 py-2">{trial.title}</td>
                      <td className="px-3 py-2">{trial.condition}</td>
                      <td className="px-3 py-2">{trial.location}</td>
                      <td className="px-3 py-2">{trial.phase}</td>
                      <td className="px-3 py-2">
                        {trial.minAge} - {trial.maxAge}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setExpandedTrialId(isOpen ? "" : trial.trialId)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {isOpen ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr key={`${trial.trialId}-details`}>
                        <td className="px-3 py-3" colSpan={7}>
                          <div className="grid gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-2">
                            <article>
                              <h4 className="font-semibold text-slate-800">Inclusion Criteria</h4>
                              <p className="mt-2 whitespace-pre-wrap text-slate-700">{trial.inclusionCriteria}</p>
                            </article>
                            <article>
                              <h4 className="font-semibold text-slate-800">Exclusion Criteria</h4>
                              <p className="mt-2 whitespace-pre-wrap text-slate-700">{trial.exclusionCriteria}</p>
                            </article>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && trials.length === 0 ? <p className="mt-4 text-sm text-slate-500">No trials found.</p> : null}
        {message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </section>
    </div>
  );
}
