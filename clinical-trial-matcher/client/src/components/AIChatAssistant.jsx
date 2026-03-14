import { useState } from "react";
import { fetchChatExplanation } from "../services/api";
import { Bot, Send, Loader2, Sparkles, Lightbulb } from "lucide-react";

const SUGGESTED = [
  "Why was this trial recommended?",
  "Is age the main matching factor?",
  "Which exclusion criteria were checked?",
  "What would make this patient ineligible?"
];

export default function AIChatAssistant({ patient, trial, matchingResult, matchExplanation }) {
  const [question, setQuestion] = useState("Why was this trial recommended?");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askQuestion(q) {
    setError("");
    if (!trial || !matchingResult) { setError("Select a recommended trial first."); return; }
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetchChatExplanation({ question: q, patient, trial, matchingResult, matchExplanation });
      setMessages((prev) => [...prev, { question: q, answer: res.answer, base: res.matchExplanation }]);
      setQuestion("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to get response.");
    } finally { setLoading(false); }
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">AI Chat Assistant</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-indigo-400 bg-indigo-400/10 border border-indigo-400/15 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Contextual AI
        </span>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); askQuestion(question.trim()); }} className="flex gap-2">
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about the selected trial match"
          className="flex-1 rounded-xl px-4 py-2.5 text-sm bg-white/[0.02] border border-white/[0.05] text-slate-200 placeholder:text-slate-400 outline-none focus:border-teal-500/30 transition-all" />
        <button type="submit" disabled={loading} className="btn-glow flex items-center gap-2 flex-shrink-0 px-4">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTED.map((q) => (
          <button key={q} type="button" onClick={() => { setQuestion(q); askQuestion(q); }} disabled={loading}
            className="rounded-full px-3 py-1.5 text-[11px] font-medium text-slate-300 disabled:opacity-30 transition-all flex items-center gap-1.5 hover:text-teal-400 hover:border-teal-400/20"
            style={{ background: 'rgba(6,10,19,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <Lightbulb className="w-3 h-3" /> {q}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-5 space-y-3">
        {messages.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ background: 'rgba(6,10,19,0.4)', border: '1px dashed rgba(255,255,255,0.04)' }}>
            <Bot className="w-10 h-10 text-slate-400/40 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No conversation yet</p>
            <p className="text-xs text-slate-300 mt-1">Select a trial and ask a question to begin.</p>
          </div>
        ) : (
          messages.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm"
                     style={{ background: 'rgba(20,184,166,0.08)', color: '#5eead4', border: '1px solid rgba(20,184,166,0.1)' }}>
                  {item.question}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[75%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-400"
                     style={{ background: 'rgba(6,10,19,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  {item.answer}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
