import { useState, useEffect } from "react";
import { Eye, Loader2, TrendingUp, ArrowUpRight, Trophy, Bookmark } from "lucide-react";

const HighlightedText = ({ text, patientForm }) => {
  if (!text) return null;
  const keywordsToHighlight = [
    ...(patientForm?.conditions || "").split(",").map(s => s.trim()).filter(Boolean),
    ...(patientForm?.medications || "").split(",").map(s => s.trim()).filter(Boolean),
    "Age", "Gender", "Eligible", "Location", patientForm?.age, patientForm?.gender, patientForm?.location
  ].filter(Boolean);

  if (!keywordsToHighlight.length) return <>{text}</>;
  const escapedKeywords = keywordsToHighlight.map(k => String(k).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escapedKeywords.join("|")})\\b`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isMatch = keywordsToHighlight.some(k => String(k).toLowerCase() === part.toLowerCase());
        return isMatch ? (
          <span key={i} className="px-1.5 py-0.5 rounded text-teal-300 bg-teal-400/10 font-medium">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
};

export default function RecommendedTrialsList({ recommendations, selectedTrialId, onSelectTrial, explanationByTrial, explanationLoading, patientForm }) {
  const [savedTrials, setSavedTrials] = useState(() => {
    try {
      const saved = localStorage.getItem("saved-trials");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("saved-trials", JSON.stringify(savedTrials));
  }, [savedTrials]);

  const toggleSave = (trialId, e) => {
    e.stopPropagation();
    setSavedTrials(prev => 
      prev.includes(trialId) ? prev.filter(id => id !== trialId) : [...prev, trialId]
    );
  };
  if (!recommendations.length) {
    return (
      <div className="rounded-2xl p-6" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-4">Recommended Trials</p>
        <div className="rounded-xl p-8 text-center" style={{ background: 'rgba(6,10,19,0.4)', border: '1px dashed rgba(255,255,255,0.04)' }}>
          <TrendingUp className="w-10 h-10 text-slate-400/40 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No recommendations yet</p>
          <p className="text-xs text-slate-300 mt-1">Generate matches to see results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Recommended Trials</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-teal-400 bg-teal-400/10 border border-teal-400/15">{recommendations.length} matched</span>
      </div>

      <div className="space-y-3">
        {recommendations.map((item, idx) => {
          const isSelected = selectedTrialId === item.trialId;
          const explanation = explanationByTrial[item.trialId];
          const scoreColor = item.score >= 80 ? "#14b8a6" : item.score >= 60 ? "#f59e0b" : "#f43f5e";

          return (
            <article key={item.trialId}
              className="rounded-xl p-4 transition-all duration-300"
              style={{
                background: isSelected ? 'rgba(20,184,166,0.04)' : 'rgba(6,10,19,0.3)',
                border: `1px solid ${isSelected ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.03)'}`,
                boxShadow: isSelected ? '0 0 20px rgba(20,184,166,0.08)' : 'none'
              }}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                       style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: idx === 0 ? '#fbbf24' : '#64748b' }}>
                    {idx === 0 ? <Trophy className="w-3 h-3" /> : `#${idx + 1}`}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">Trial ID</p>
                    <p className="font-bold text-slate-200 text-sm">{item.trialId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={(e) => toggleSave(item.trialId, e)}
                    className={`p-2 rounded-xl border transition-all ${savedTrials.includes(item.trialId) ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-slate-200'}`}>
                    <Bookmark className="w-4 h-4" size={16} fill={savedTrials.includes(item.trialId) ? "currentColor" : "none"} />
                  </button>
                  <div className="text-right px-3 py-2 rounded-xl" style={{ background: `${scoreColor}0d`, border: `1px solid ${scoreColor}20` }}>
                    <p className="text-[10px] uppercase tracking-wider text-slate-300">Score</p>
                    <p className="text-2xl font-black tabular-nums leading-none" style={{ color: scoreColor }}>{item.score}</p>
                  </div>
                </div>
              </div>

              {/* Score bar */}
              <div className="mt-3 h-1 rounded-full w-full" style={{ background: 'rgba(148,163,184,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.score}%`, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}88)`, boxShadow: `0 0 8px ${scoreColor}30` }} />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button type="button" onClick={() => onSelectTrial(item.trialId)}
                  className="btn-outline py-1.5 px-3 text-[11px] flex items-center gap-1.5">
                  <Eye className="w-3 h-3" /> {isSelected ? "Selected" : "Explain"}
                  {!isSelected && <ArrowUpRight className="w-3 h-3" />}
                </button>
                {explanationLoading && isSelected && (
                  <span className="text-[11px] text-slate-300 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                  </span>
                )}
              </div>

              {explanation && (
                <div className="mt-3 rounded-xl p-3.5 text-sm text-slate-400 leading-relaxed animate-fadeIn"
                     style={{ background: 'rgba(6,10,19,0.4)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <HighlightedText text={explanation} patientForm={patientForm} />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
