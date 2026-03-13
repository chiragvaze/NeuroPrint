import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import MetricCard from "../components/MetricCard.jsx";

const trendData = [
  { day: "Mon", drift: 12 },
  { day: "Tue", drift: 18 },
  { day: "Wed", drift: 16 },
  { day: "Thu", drift: 27 },
  { day: "Fri", drift: 22 },
  { day: "Sat", drift: 19 },
  { day: "Sun", drift: 24 }
];

function DashboardPage() {
  return (
    <div className="min-h-screen px-4 py-10 sm:px-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-8 max-w-6xl"
      >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">
          NeuroPrint System
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
          Cognitive Drift Intelligence Dashboard
        </h1>
      </motion.header>

      <section className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Current Drift Score" value="24.2" accent="text-sky-600" />
        <MetricCard title="Typing Stability" value="87%" accent="text-emerald-600" />
        <MetricCard title="Mouse Consistency" value="81%" accent="text-cyan-700" />
        <MetricCard title="Alerts (7d)" value="3" accent="text-rose-600" />
      </section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-auto mt-8 max-w-6xl rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-lg"
      >
        <h2 className="mb-4 text-xl font-semibold text-ink">Weekly Drift Trend</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="driftGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area type="monotone" dataKey="drift" stroke="#0284c7" fill="url(#driftGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.section>
    </div>
  );
}

export default DashboardPage;
