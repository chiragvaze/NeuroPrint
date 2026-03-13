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
import AIChatAssistant from "../components/AIChatAssistant";
import PatientProfileCard from "../components/PatientProfileCard";
import { BarChart3, MapPin, Zap, TrendingUp, AlertCircle } from "lucide-react";

const DEFAULT_PATIENT = {
  patientId: "",
  age: "",
  gender: "",
  conditions: "",
  medications: "",
  location: ""
};

function toList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePatient(patientForm) {
  return {
    patientId: patientForm.patientId,
    age: Number(patientForm.age),
    gender: patientForm.gender,
    conditions: toList(patientForm.conditions),
    medications: toList(patientForm.medications),
    location: patientForm.location
  };
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

  const bestScore = useMemo(() => {
    if (!recommendations.length) return 0;
    return recommendations[0].score;
  }, [recommendations]);

  const selectedTrial = useMemo(
    () => trialsCache.find((item) => item.trialId === selectedTrialId) || null,
    [selectedTrialId, trialsCache]
  );

  const selectedMatchingResult = useMemo(() => {
    const item = recommendations.find((entry) => entry.trialId === selectedTrialId);
    if (!item) return null;

    return {
      eligible: item.score >= 70,
      finalScore: item.score / 100,
      reasons: [
        "Age within range",
        "Required condition present",
        "No exclusion conditions detected"
      ]
    };
  }, [recommendations, selectedTrialId]);

  function onPatientChange(event) {
    const { name, value } = event.target;
    setPatientForm((prev) => ({ ...prev, [name]: value }));
  }

  function filterTrialsByLocation(trials) {
    if (!geoFilter.trim()) return trials;

    const query = geoFilter.toLowerCase();
    return trials.filter((trial) => String(trial.location || "").toLowerCase().includes(query));
  }

  async function generateRecommendations() {
    setLoading(true);
    setError("");

    try {
      const patient = normalizePatient(patientForm);
      const trialsResponse = await fetchAllTrials({});
      const trials = filterTrialsByLocation(trialsResponse.trials || []);

      if (!trials.length) {
        throw new Error("No trials found for the selected geographic filter.");
      }

      const recommendationsResponse = await fetchRecommendations({
        patient,
        trials
      });

      setTrialsCache(trials);
      setRecommendations(recommendationsResponse.recommendations || []);
      setSelectedTrialId("");
      setExplanationByTrial({});
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Failed to generate recommendations.");
    } finally {
      setLoading(false);
    }
  }

  async function loadExplanation(trialId) {
    setSelectedTrialId(trialId);

    if (explanationByTrial[trialId]) {
      return;
    }

    setExplanationLoading(true);
    setError("");

    try {
      const trial = trialsCache.find((item) => item.trialId === trialId);
      const matchingResult = recommendations.find((item) => item.trialId === trialId);
      const patient = normalizePatient(patientForm);

      if (!trial || !matchingResult) {
        throw new Error("Unable to find trial details for explanation.");
      }

      const response = await fetchMatchExplanation({
        patient,
        trial,
        matchingResult: {
          eligible: matchingResult.score >= 70,
          finalScore: matchingResult.score / 100,
          reasons: [
            "Age within range",
            "Required condition present",
            "No exclusion conditions detected"
          ]
        }
      });

      setExplanationByTrial((prev) => ({
        ...prev,
        [trialId]: response.explanation
      }));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Failed to generate explanation.");
    } finally {
      setExplanationLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <section className="card-surface p-6 animate-fadeInUp">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-xl bg-accent-teal/10">
            <BarChart3 className="w-5 h-5 text-accent-teal" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Match Results Dashboard</h2>
            <p className="mt-1 text-sm text-slate-400">
              Generate trial recommendations, inspect confidence scores, and view AI explanations.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input name="patientId" placeholder="Patient ID (e.g., PAT-3001)" value={patientForm.patientId} onChange={onPatientChange} className="input-dark" />
          <input type="number" name="age" placeholder="Age" value={patientForm.age} onChange={onPatientChange} className="input-dark" />
          <input name="gender" placeholder="Gender" value={patientForm.gender} onChange={onPatientChange} className="input-dark" />
          <input name="location" placeholder="Patient Location" value={patientForm.location} onChange={onPatientChange} className="input-dark" />
          <input name="conditions" placeholder="Conditions (comma-separated)" value={patientForm.conditions} onChange={onPatientChange} className="input-dark md:col-span-2" />
          <input name="medications" placeholder="Medications (comma-separated)" value={patientForm.medications} onChange={onPatientChange} className="input-dark md:col-span-1" />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={geoFilter}
              onChange={(event) => setGeoFilter(event.target.value)}
              placeholder="Geographic Filter (e.g., Mumbai, India)"
              className="input-dark pl-10"
            />
          </div>
          <button
            type="button"
            onClick={generateRecommendations}
            disabled={loading}
            className="btn-glow flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {loading ? "Generating..." : "Generate Matches"}
          </button>
        </div>

        {/* Score Card */}
        <div className="mt-5 card-surface p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Match Confidence Score
            </p>
            <p className="mt-1 text-4xl font-extrabold text-gradient">{bestScore}</p>
          </div>
          {recommendations.length > 0 && (
            <span className="badge-teal">{recommendations.length} matches</span>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}
      </section>

      <AIChatAssistant
        patient={normalizePatient(patientForm)}
        trial={selectedTrial}
        matchingResult={selectedMatchingResult}
        matchExplanation={selectedTrialId ? explanationByTrial[selectedTrialId] : ""}
      />

      <PatientProfileCard patientId={patientForm.patientId} />

      <div className="grid gap-6 xl:grid-cols-2">
        <RecommendedTrialsList
          recommendations={recommendations}
          selectedTrialId={selectedTrialId}
          onSelectTrial={loadExplanation}
          explanationByTrial={explanationByTrial}
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
