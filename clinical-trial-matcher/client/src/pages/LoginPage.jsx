import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Activity, Lock, UserPlus, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const { login, register, authError } = useAuth();
  const navigate = useNavigate();

  const pageTitle = useMemo(
    () => (mode === "login" ? "Sign in to your account" : "Create clinician account"),
    [mode]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "register" && name.trim().length < 2) {
      setLocalError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    setLocalError("");

    const result =
      mode === "login"
        ? await login({ email, password })
        : await register({ name, email, password, role });

    setSubmitting(false);

    if (result?.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center items-center font-sans px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-accent-teal/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-accent-indigo/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md card-surface p-8 relative z-10 animate-fadeInUp">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-to-r from-accent-teal via-accent-cyan to-accent-indigo"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 rounded-2xl bg-accent-teal/10 mb-4">
            <Activity className="text-accent-teal w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">{pageTitle}</h2>
          <p className="text-slate-400 text-sm mt-1">Access is limited to doctors and clinical researchers</p>
        </div>

        {/* Mode Tabs */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl p-1" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
              mode === "login"
                ? "bg-accent-teal/15 text-accent-teal shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
              mode === "register"
                ? "bg-accent-teal/15 text-accent-teal shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Register
          </button>
        </div>

        {(localError || authError) && (
          <div className="mb-4 rounded-xl border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 text-sm text-red-300">
            {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Dr. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-dark"
                required={mode === "register"}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="doctor@clinic.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-dark"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-dark"
              required
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5" htmlFor="role">
                User Type
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-dark"
              >
                <option value="doctor">Doctor</option>
                <option value="clinical_researcher">Clinical Researcher</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-slate-400">
              <input type="checkbox" className="mr-2 rounded border-slate-600 bg-dark-800 text-accent-teal focus:ring-accent-teal/30" />
              Remember me
            </label>
            <a href="#" className="text-sm font-medium text-accent-teal hover:text-accent-cyan transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-glow flex justify-center items-center gap-2 mt-6 py-3.5"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "login" ? (
              <Lock className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {submitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-slate-500">
          Use your verified institution email to keep patient workflows secure.
        </p>
      </div>
    </div>
  );
}
