import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#14b8a6", "#f59e0b"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background: 'rgba(10,15,28,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 12px 48px rgba(0,0,0,0.5)' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: d.payload.fill }}>{d.name}: {d.value}</p>
    </div>
  );
};

export default function EligibilityDistributionChart({ recommendations }) {
  const eligible = recommendations.filter((r) => r.score >= 70).length;
  const ineligible = recommendations.length - eligible;
  const data = [
    { name: "Eligible", value: eligible },
    { name: "Ineligible", value: ineligible }
  ];

  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-4">Eligibility Distribution</p>
      {recommendations.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-sm text-slate-300">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" strokeWidth={0} paddingAngle={4}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} style={{ filter: `drop-shadow(0 0 6px ${COLORS[i]}40)` }} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>{value}</span>}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
