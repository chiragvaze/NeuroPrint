import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <p style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 600 }}>Rank #{data.rank}</p>
      <p style={{ color: '#94a3b8', fontSize: '12px' }}>{data.trialId}</p>
      <p style={{ color: '#22d3ee', fontSize: '13px', marginTop: '2px' }}>Score: {data.score}</p>
    </div>
  );
};

export default function TrialRankingChart({ recommendations }) {
  const rankingData = recommendations.map((item, index) => ({
    rank: index + 1,
    trialId: item.trialId,
    score: item.score
  }));

  return (
    <div className="card-surface p-6 animate-fadeInUp">
      <h3 className="text-lg font-semibold text-slate-100">Trial Ranking Trend</h3>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer>
          <AreaChart data={rankingData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
            <XAxis dataKey="rank" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: 'rgba(148, 163, 184, 0.1)' }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: 'rgba(148, 163, 184, 0.1)' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(34, 211, 238, 0.2)' }} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#22d3ee"
              strokeWidth={3}
              fill="url(#areaGradient)"
              dot={{ r: 5, fill: '#0f172a', stroke: '#22d3ee', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#22d3ee', stroke: '#0f172a', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
