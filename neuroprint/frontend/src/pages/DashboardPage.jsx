import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { fetchProfile } from "../services/authService";
import BehaviorCapture from "../components/BehaviorCapture";
import { fetchRiskPrediction } from "../services/predictService";
import { clearBehaviorHistory, fetchBehaviorHistory } from "../services/behaviorService";

const getRiskTheme = (drift) => {
  if (drift >= 0.25) {
    return {
      status: "High Drift",
      statusClass: "text-red-700",
      chipClass: "bg-red-100 text-red-700"
    };
  }

  if (drift >= 0.1) {
    return {
      status: "Moderate Drift",
      statusClass: "text-amber-700",
      chipClass: "bg-amber-100 text-amber-700"
    };
  }

  return {
    status: "Stable",
    statusClass: "text-emerald-700",
    chipClass: "bg-emerald-100 text-emerald-700"
  };
};

function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState("");
  const [behaviorHistory, setBehaviorHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");
  const [isClearingHistory, setIsClearingHistory] = useState(false);

  const chartSeries = behaviorHistory.map((entry, index) => ({
    label: `S${index + 1}`,
    typingSpeed: entry.typingSpeed,
    keyDelay: entry.avgKeyDelay,
    mouseSpeed: entry.mouseSpeed,
    drift: entry.driftScore,
    stability: entry.stabilityScore
  }));

  const latestDrift = chartSeries.length ? Number(chartSeries[chartSeries.length - 1].drift || 0) : 0;
  const latestStability = chartSeries.length
    ? Number(chartSeries[chartSeries.length - 1].stability || 100)
    : 100;
  const hasEnoughHistory = chartSeries.length >= 2;
  const stabilityScore = Math.round(latestStability);
  const riskTheme = getRiskTheme(latestDrift);

  const loadBehaviorHistory = async () => {
    try {
      const data = await fetchBehaviorHistory();
      setBehaviorHistory(Array.isArray(data.history) ? data.history : []);
      setHistoryError("");
    } catch (requestError) {
      setHistoryError(requestError.response?.data?.message || "Behavior history unavailable");
    }
  };

  const loadPrediction = async () => {
    try {
      const data = await fetchRiskPrediction();
      setPrediction(data);
      setPredictionError("");
    } catch (requestError) {
      setPredictionError(requestError.response?.data?.message || "Prediction unavailable");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setProfile(data.user);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    loadBehaviorHistory();
    loadPrediction();
  }, []);

  const handleClearHistory = async () => {
    setHistoryStatus("");
    setIsClearingHistory(true);

    try {
      const result = await clearBehaviorHistory();
      setHistoryStatus(`History cleared. Deleted ${result.deletedCount} session records.`);
      await Promise.all([loadBehaviorHistory(), loadPrediction()]);
    } catch (requestError) {
      setHistoryStatus(requestError.response?.data?.message || "Failed to clear history");
    } finally {
      setIsClearingHistory(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("neuroprint_token");
    localStorage.removeItem("neuroprint_user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">NeuroPrint</p>
            <h1 className="mt-2 text-3xl font-bold text-ink">Cognitive Intelligence Dashboard</h1>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate("/baseline")}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Set / Update Baseline
            </button>

            <button
              type="button"
              onClick={handleClearHistory}
              disabled={isClearingHistory}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-70"
            >
              {isClearingHistory ? "Clearing..." : "Reset My History"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-800">Authenticated User Profile</h2>

          {loading && <p className="mt-2 text-sm text-slate-500">Loading profile...</p>}
          {!loading && error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

          {!loading && !error && profile && (
            <>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Name:</span> {profile.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {profile.email}
                </p>
                <p>
                  <span className="font-semibold">Created:</span>{" "}
                  {new Date(profile.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Baseline Typing Speed:</span>{" "}
                  {profile.baselineProfile?.typingSpeed?.toFixed?.(2) || 0}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
          <p className="font-semibold">How to test correctly</p>
          <p className="mt-1">
            Use <span className="font-semibold">Set / Update Baseline</span> first (one session), then use
            <span className="font-semibold"> Behavior Capture</span> at the bottom for ongoing sessions that feed
            charts, drift, and forecast.
          </p>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mt-8 rounded-xl border border-slate-200 bg-white p-6"
        >
          <p className="text-sm uppercase tracking-[0.12em] text-slate-500">Cognitive Stability Score</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className={`text-5xl font-bold ${hasEnoughHistory ? riskTheme.statusClass : "text-slate-500"}`}>
                {hasEnoughHistory ? `${stabilityScore}%` : "N/A"}
              </span>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                {hasEnoughHistory ? (
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${riskTheme.chipClass}`}
                  >
                    {riskTheme.status}
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                    Need More Sessions
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-500">
              {hasEnoughHistory
                ? "Derived from latest baseline vs behavior similarity"
                : "Capture at least 2 ongoing sessions after baseline for reliable scoring"}
            </p>
          </div>
        </motion.section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h3 className="text-lg font-semibold text-slate-800">Typing Behavior Chart</h3>
            <p className="mt-1 text-sm text-slate-500">Typing speed over time</p>
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Line type="monotone" dataKey="typingSpeed" stroke="#16a34a" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h3 className="text-lg font-semibold text-slate-800">Key Delay Variance</h3>
            <p className="mt-1 text-sm text-slate-500">Inter-key delay stability snapshot</p>
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Bar dataKey="keyDelay" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h3 className="text-lg font-semibold text-slate-800">Mouse Movement Chart</h3>
            <p className="mt-1 text-sm text-slate-500">Mouse speed variation profile</p>
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartSeries}>
                  <defs>
                    <linearGradient id="mouseArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="mouseSpeed"
                    stroke="#16a34a"
                    fill="url(#mouseArea)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h3 className="text-lg font-semibold text-slate-800">Drift Timeline</h3>
            <p className="mt-1 text-sm text-slate-500">Recent cognitive drift progression</p>
            <div className="mt-4 h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[0, 0.3]} />
                  <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                  <Line type="monotone" dataKey="drift" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>

        {historyError && <p className="mt-3 text-sm text-rose-600">{historyError}</p>}
        {historyStatus && <p className="mt-3 text-sm text-slate-700">{historyStatus}</p>}
        {!historyError && chartSeries.length === 0 && (
          <p className="mt-3 text-sm text-slate-500">
            No behavior history found yet. Capture a session to populate charts.
          </p>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="mt-8 rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">30-Day Cognitive Forecast</h3>
              <p className="mt-1 text-sm text-slate-500">
                Linear regression prediction from stability score history
              </p>
            </div>

            {prediction && (
              <div className="text-right">
                <p className="text-sm text-slate-500">Predicted Stability</p>
                <p className="text-2xl font-bold text-sky-700">{prediction.predictedStability}%</p>
                <p className="text-sm font-semibold text-slate-700">Trend: {prediction.trend}</p>
              </div>
            )}
          </div>

          {predictionError && <p className="mt-4 text-sm text-rose-600">{predictionError}</p>}

          {!predictionError && (
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={prediction?.forecastSeries || [
                    { point: "Now", stability: 88 },
                    { point: "+30d", stability: 87 }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="point" stroke="#64748b" />
                  <YAxis domain={[0, 100]} stroke="#64748b" />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                  <Line type="monotone" dataKey="stability" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.section>

        <BehaviorCapture
          userId={profile?._id || profile?.id}
          onCaptureComplete={async () => {
            await Promise.all([loadBehaviorHistory(), loadPrediction()]);
          }}
        />
      </div>
    </div>
  );
}

export default DashboardPage;
