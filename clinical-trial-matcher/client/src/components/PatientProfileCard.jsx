import { useEffect, useState } from "react";
import { fetchPatientById } from "../services/api";
import { User, Clock, HeartPulse, MapPin } from "lucide-react";

export default function PatientProfileCard({ patientId }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!patientId?.trim()) { setPatient(null); setError(""); return; }
      setLoading(true); setError("");
      try {
        const res = await fetchPatientById(patientId.trim());
        setPatient(res?.patient || null);
      } catch (err) {
        setPatient(null);
        setError(err?.response?.data?.message || "Unable to load patient profile.");
      } finally { setLoading(false); }
    }
    load();
  }, [patientId]);

  const stats = patient ? [
    { icon: User, label: "Patient ID", value: patient.patientId, color: "#14b8a6" },
    { icon: Clock, label: "Age", value: patient.age, color: "#22d3ee" },
    { icon: HeartPulse, label: "Conditions", value: Array.isArray(patient.conditions) && patient.conditions.length ? patient.conditions.join(", ") : "–", color: "#f59e0b" },
    { icon: MapPin, label: "Location", value: patient.location || "–", color: "#6366f1" }
  ] : [];

  return (
    <div className="rounded-2xl p-6" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-4">Patient Profile</p>

      {!patientId?.trim() && (
        <div className="rounded-xl p-8 text-center" style={{ background: 'rgba(6,10,19,0.4)', border: '1px dashed rgba(255,255,255,0.04)' }}>
          <User className="w-10 h-10 text-slate-400/40 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Enter a patient ID to view profile</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" /> Loading...
        </div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && patient && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl p-4 group transition-all hover:border-white/[0.08]"
                 style={{ background: 'rgba(6,10,19,0.5)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                     style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{s.label}</span>
              </div>
              <p className="text-[13px] font-bold text-slate-200">{s.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
