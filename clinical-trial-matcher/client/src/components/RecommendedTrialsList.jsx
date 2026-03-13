import { Eye, Loader2 } from "lucide-react";

export default function RecommendedTrialsList({
  recommendations,
  selectedTrialId,
  onSelectTrial,
  explanationByTrial,
  explanationLoading
}) {
  if (!recommendations.length) {
    return (
      <div className="card-surface p-6">
        <h3 className="text-lg font-semibold text-slate-100">Recommended Trials List</h3>
        <p className="mt-3 text-sm text-slate-500">Run matching to see recommendations.</p>
      </div>
    );
  }

  return (
    <div className="card-surface p-6 animate-fadeInUp">
      <h3 className="text-lg font-semibold text-slate-100 flex items-center justify-between">
        <span>Recommended Trials</span>
        <span className="badge-teal">{recommendations.length} matched</span>
      </h3>
      <div className="mt-4 space-y-3">
        {recommendations.map((item) => {
          const isSelected = selectedTrialId === item.trialId;
          const explanation = explanationByTrial[item.trialId];

          const scoreColor = item.score >= 80
            ? "text-accent-teal"
            : item.score >= 60
              ? "text-accent-amber"
              : "text-accent-rose";

          return (
            <article
              key={item.trialId}
              className={`rounded-xl p-4 transition-all duration-300 ${
                isSelected
                  ? "glow-ring"
                  : "hover:border-accent-teal/15"
              }`}
              style={{
                background: isSelected ? 'rgba(20, 184, 166, 0.06)' : 'rgba(15, 23, 42, 0.4)',
                border: `1px solid ${isSelected ? 'rgba(20, 184, 166, 0.35)' : 'rgba(148, 163, 184, 0.1)'}`
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">Trial ID</p>
                  <p className="font-semibold text-slate-200">{item.trialId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Score</p>
                  <p className={`text-2xl font-extrabold ${scoreColor}`}>{item.score}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTrial(item.trialId)}
                  className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {isSelected ? "Selected" : "View Explanation"}
                </button>
                {explanationLoading && isSelected && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                  </span>
                )}
              </div>

              {explanation && (
                <p className="mt-3 text-sm text-slate-400 leading-relaxed rounded-lg p-3" style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(148, 163, 184, 0.06)' }}>
                  {explanation}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
