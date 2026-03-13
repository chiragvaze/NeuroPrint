import { useState } from "react";
import { fetchChatExplanation } from "../services/api";
import { Bot, Send, Loader2, Sparkles } from "lucide-react";

const SUGGESTED_QUESTIONS = [
  "Why was this trial recommended?",
  "Is age the main reason this trial matched?",
  "Which exclusion criteria were checked?",
  "What would make this patient ineligible?"
];

export default function AIChatAssistant({
  patient,
  trial,
  matchingResult,
  matchExplanation
}) {
  const [question, setQuestion] = useState("Why was this trial recommended?");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askQuestion(askedQuestion) {
    setError("");

    if (!trial || !matchingResult) {
      setError("Select a recommended trial first to start chat.");
      return;
    }

    if (!askedQuestion.trim()) {
      setError("Ask a question to continue.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetchChatExplanation({
        question: askedQuestion,
        patient,
        trial,
        matchingResult,
        matchExplanation
      });

      setMessages((prev) => [
        ...prev,
        {
          question: askedQuestion,
          answer: response.answer,
          base: response.matchExplanation
        }
      ]);
      setQuestion("");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to get chatbot response.");
    } finally {
      setLoading(false);
    }
  }

  async function askAssistant(event) {
    event.preventDefault();
    const askedQuestion = question.trim();
    await askQuestion(askedQuestion);
  }

  return (
    <section className="card-surface p-6 animate-fadeInUp">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Bot className="w-5 h-5 text-accent-cyan" /> AI Chat Assistant
        </h3>
        <span className="badge-indigo">
          <Sparkles className="w-3 h-3 mr-1" /> OpenAI Chat
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-400">
        Ask context-aware questions like: "Why was Trial A recommended?"
      </p>

      {/* Input */}
      <form onSubmit={askAssistant} className="mt-4 flex gap-3">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about the selected trial match"
          className="input-dark flex-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-glow flex items-center gap-2 flex-shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </form>

      {/* Suggested questions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setQuestion(item);
              askQuestion(item);
            }}
            disabled={loading}
            className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 disabled:opacity-40"
            style={{
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              color: '#94a3b8'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(20, 184, 166, 0.35)';
              e.target.style.color = '#5eead4';
              e.target.style.background = 'rgba(20, 184, 166, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(148, 163, 184, 0.12)';
              e.target.style.color = '#94a3b8';
              e.target.style.background = 'rgba(15, 23, 42, 0.5)';
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}

      {/* Chat messages */}
      <div className="mt-5 space-y-3">
        {messages.length === 0 ? (
          <div className="card-surface p-5 text-sm text-slate-500 text-center">
            No chat yet. Select a recommended trial and ask a question.
          </div>
        ) : (
          messages.map((item, index) => (
            <div key={`${item.question}-${index}`} className="space-y-2">
              {/* User */}
              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-xl rounded-br-sm px-4 py-2.5 text-sm" style={{ background: 'rgba(20, 184, 166, 0.12)', color: '#5eead4' }}>
                  {item.question}
                </div>
              </div>
              {/* AI */}
              <div className="flex justify-start">
                <div className="max-w-[75%] space-y-1.5">
                  <div className="rounded-xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-300" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                    {item.answer}
                  </div>
                  {item.base && (
                    <p className="text-xs text-slate-500 px-1">Base: {item.base}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
