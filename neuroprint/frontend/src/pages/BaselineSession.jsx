import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BehaviorCapture from "../components/BehaviorCapture";
import { createBaselineProfile } from "../services/baselineService";

const TYPING_PROMPT = "The quick brown fox jumps over the lazy dog.";

function BaselineSession() {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const [mousePathPoints, setMousePathPoints] = useState(0);
  const [baseline, setBaseline] = useState(null);
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleMouseTrack = () => {
    setMousePathPoints((count) => count + 1);
  };

  const handleCaptureComplete = async (features) => {
    setStatus("");
    setIsSaving(true);

    try {
      const result = await createBaselineProfile({
        sessions: [
          {
            typingSpeed: features.typingSpeed,
            avgKeyDelay: features.avgKeyDelay,
            mouseSpeed: features.mouseSpeed,
            clickLatency: features.clickLatency
          }
        ]
      });

      setBaseline(result.baselineProfile);
      setStatus("Baseline profile created successfully.");
    } catch (error) {
      if (error.response?.status === 404) {
        localStorage.removeItem("neuroprint_token");
        localStorage.removeItem("neuroprint_user");
        setStatus("Session expired or user not found. Please login again.");
        navigate("/login", { replace: true });
        return;
      }

      setStatus(error.response?.data?.message || "Failed to create baseline profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
              NeuroPrint Onboarding
            </p>
            <h1 className="mt-2 text-3xl font-bold text-ink">Baseline Session</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-800">1. Typing Test</h2>
            <p className="mt-2 rounded-lg bg-white p-3 text-sm text-slate-700">{TYPING_PROMPT}</p>
            <textarea
              value={typedText}
              onChange={(event) => setTypedText(event.target.value)}
              placeholder="Type the sentence above here..."
              className="mt-3 h-32 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-emerald-500"
            />
            <p className="mt-2 text-xs text-slate-500">
              Progress: {typedText.length}/{TYPING_PROMPT.length} characters
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-800">2. Mouse Tracking Test</h2>
            <p className="mt-2 text-sm text-slate-600">
              Move your cursor around the box and perform a few clicks.
            </p>
            <div
              onMouseMove={handleMouseTrack}
              className="mt-3 h-32 rounded-lg border-2 border-dashed border-emerald-300 bg-white"
            />
            <p className="mt-2 text-xs text-slate-500">Mouse movement samples: {mousePathPoints}</p>
          </section>
        </div>

        <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
          Complete this once to set your personal baseline fingerprint. After this, go back to Dashboard and use
          Behavior Capture there for daily/ongoing monitoring.
        </div>

        <BehaviorCapture autoSend submitLabel="Stop Session" onCaptureComplete={handleCaptureComplete} />

        {isSaving && <p className="mt-4 text-sm text-slate-600">Saving baseline profile...</p>}
        {status && <p className="mt-2 text-sm text-slate-700">{status}</p>}

        {baseline && (
          <pre className="mt-4 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
            {JSON.stringify(baseline, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default BaselineSession;
