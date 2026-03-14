import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,15,28,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 12px 48px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{label}</p>
      <p style={{ fontSize: 12, color: '#14b8a6', fontWeight: 600, marginTop: 2 }}>Score: {payload[0].value}</p>
    </div>
  );
};

export default function MatchConfidenceChart({ recommendations }) {
  const data = recommendations.map((r) => ({ name: r.trialId, score: r.score }));

  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-4">Match Confidence</p>
      {data.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-sm text-slate-300">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} barCategoryGap="20%">
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.04)" />
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(20,184,166,0.04)' }} />
            <Bar dataKey="score" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
