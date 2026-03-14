import { useState } from "react";
import { fetchChatExplanation } from "../services/api";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";

export default function FloatingAIChatbot() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("Why was this trial recommended?");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onAsk(e) {
    e.preventDefault();
    if (!question.trim()) { setError("Ask a question first."); return; }
    setLoading(true); setError("");
    try {
      const asked = question.trim();
      const res = await fetchChatExplanation({ question: asked });
      setMessages((prev) => [...prev, { question: asked, answer: res.answer }]);
      setQuestion("");
    } catch (err) {
      setError(err?.response?.data?.message || "Chatbot request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-[24rem] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 animate-fadeInUp"
             style={{ background: 'rgba(12, 18, 34, 0.97)', border: '1px solid rgba(148, 163, 184, 0.08)', backdropFilter: 'blur(24px)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.06)' }}>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-accent-teal/10 border border-accent-teal/10">
                <Sparkles className="w-4 h-4 text-accent-teal" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">AI Assistant</p>
                <p className="text-[10px] text-slate-300">Ask anything about trials</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-slate-300 hover:bg-white/[0.03] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="max-h-72 space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-300">Ask anything about trial matching. For contextual answers, select a trial in Match Dashboard first.</p>
            ) : (
              messages.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm px-3.5 py-2 text-sm"
                         style={{ background: 'rgba(20, 184, 166, 0.08)', color: '#5eead4', border: '1px solid rgba(20, 184, 166, 0.1)' }}>{item.question}</div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm text-slate-400"
                         style={{ background: 'rgba(6, 10, 19, 0.5)', border: '1px solid rgba(148, 163, 184, 0.05)' }}>{item.answer}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={onAsk} className="p-4" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.06)' }}>
            <div className="flex gap-2">
              <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask trial match question" className="input-dark flex-1 py-2.5 text-sm" />
              <button type="submit" disabled={loading} className="btn-glow px-3 py-2.5 flex-shrink-0">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
          </form>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)}
          className="relative rounded-2xl p-4 shadow-2xl shadow-black/50 transition-all duration-300 hover:scale-110 group"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', boxShadow: '0 0 30px rgba(20, 184, 166, 0.25), 0 8px 32px rgba(0,0,0,0.3)' }}>
          <MessageCircle className="w-6 h-6 text-white" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-accent-cyan border-2 border-dark-900 animate-pulseGlow" />
        </button>
      )}
    </div>
  );
}
