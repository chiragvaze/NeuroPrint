import { useState } from "react";
import { fetchChatExplanation } from "../services/api";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

export default function FloatingAIChatbot() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("Why was this trial recommended?");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onAsk(event) {
    event.preventDefault();

    if (!question.trim()) {
      setError("Ask a question first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const asked = question.trim();
      const response = await fetchChatExplanation({ question: asked });

      setMessages((prev) => [...prev, { question: asked, answer: response.answer }]);
      setQuestion("");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Chatbot request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[24rem] rounded-2xl border border-surface-border bg-dark-800/95 backdrop-blur-2xl shadow-2xl shadow-black/40 animate-fadeInUp">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-accent-teal/10">
                <MessageCircle className="w-4 h-4 text-accent-teal" />
              </div>
              <p className="text-sm font-semibold text-slate-100">AI Chat Assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-dark-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="max-h-72 space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-500">
                Ask anything about trial matching. For detailed reasoning, generate matches and select a trial in Match Dashboard.
              </p>
            ) : (
              messages.map((item, index) => (
                <div key={`${item.question}-${index}`} className="space-y-2">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-xl rounded-br-sm px-3 py-2 text-sm" style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#5eead4' }}>
                      {item.question}
                    </div>
                  </div>
                  {/* AI message */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-xl rounded-bl-sm px-3 py-2 text-sm card-surface text-slate-300">
                      {item.answer}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={onAsk} className="border-t border-surface-border p-4">
            <div className="flex gap-2">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask trial match question"
                className="input-dark flex-1 py-2.5"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-glow px-3 py-2.5 flex-shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full p-4 shadow-2xl shadow-black/40 transition-all duration-300 hover:scale-110 animate-pulseGlow"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
