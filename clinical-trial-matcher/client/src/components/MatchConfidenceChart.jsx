import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <p style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 600 }}>{label}</p>
      <p style={{ color: '#14b8a6', fontSize: '13px', marginTop: '2px' }}>Confidence: {payload[0].value}%</p>
    </div>
  );
};

export default function MatchConfidenceChart({ recommendations }) {
  const chartData = recommendations.map((item) => ({
    trialId: item.trialId,
    confidence: item.score
  }));

  return (
    <div className="card-surface p-6 animate-fadeInUp">
      <h3 className="text-lg font-semibold text-slate-100">Match Confidence Scores</h3>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={1} />
                <stop offset="100%" stopColor="#0d9488" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
            <XAxis dataKey="trialId" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: 'rgba(148, 163, 184, 0.1)' }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: 'rgba(148, 163, 184, 0.1)' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(20, 184, 166, 0.05)' }} />
            <Bar dataKey="confidence" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
