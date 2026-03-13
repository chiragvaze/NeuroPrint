import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#14b8a6", "#f59e0b"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <p style={{ color: data.payload.fill, fontSize: '13px', fontWeight: 600 }}>{data.name}: {data.value}</p>
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div className="flex justify-center gap-6 mt-3">
    {payload?.map((entry) => (
      <div key={entry.value} className="flex items-center gap-2 text-sm">
        <div className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
        <span className="text-slate-400">{entry.value}</span>
      </div>
    ))}
  </div>
);

export default function EligibilityDistributionChart({ recommendations }) {
  const eligibleCount = recommendations.filter((item) => item.score >= 70).length;
  const reviewCount = Math.max(0, recommendations.length - eligibleCount);

  const data = [
    { name: "Likely Eligible", value: eligibleCount },
    { name: "Needs Review", value: reviewCount }
  ];

  return (
    <div className="card-surface p-6 animate-fadeInUp">
      <h3 className="text-lg font-semibold text-slate-100">Eligibility Distribution</h3>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={95}
              innerRadius={55}
              paddingAngle={4}
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[index % COLORS.length]}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(20, 184, 166, 0.3))' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
