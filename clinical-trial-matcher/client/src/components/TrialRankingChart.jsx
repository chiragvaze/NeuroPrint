import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: 'rgba(10,15,28,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 12px 48px rgba(0,0,0,0.5)' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{d.name}</p>
      <p style={{ fontSize: 12, color: '#22d3ee', fontWeight: 600, marginTop: 2 }}>Score: {d.score}</p>
    </div>
  );
};

export default function TrialRankingChart({ recommendations }) {
  const data = [...recommendations].sort((a, b) => b.score - a.score).map((r, i) => ({ name: r.trialId, score: r.score, rank: i + 1 }));

  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-4">Trial Ranking</p>
      {data.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-sm text-slate-300">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.04)" />
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2} fill="url(#areaGrad)" dot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#22d3ee', strokeWidth: 2, stroke: '#0c1222' }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
