import { useEffect, useState } from "react";
import { fetchPatientById } from "../services/api";
import { User, Clock, Activity, MapPin } from "lucide-react";

export default function PatientProfileCard({ patientId }) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatientProfile() {
      if (!patientId?.trim()) {
        setPatient(null);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetchPatientById(patientId.trim());
        setPatient(response?.patient || null);
      } catch (requestError) {
        setPatient(null);
        setError(requestError?.response?.data?.message || "Unable to load patient profile.");
      } finally {
        setLoading(false);
      }
    }

    loadPatientProfile();
  }, [patientId]);

  const statCards = patient ? [
    {
      icon: User,
      label: "Patient ID",
      value: patient.patientId,
      color: "text-accent-teal"
    },
    {
      icon: Clock,
      label: "Age",
      value: patient.age,
      color: "text-accent-cyan"
    },
    {
      icon: Activity,
      label: "Conditions",
      value: Array.isArray(patient.conditions) && patient.conditions.length
        ? patient.conditions.join(", ")
        : "Not provided",
      color: "text-accent-amber"
    },
    {
      icon: MapPin,
      label: "Location",
      value: patient.location || "Not provided",
      color: "text-accent-indigo"
    }
  ] : [];

  return (
    <section className="card-surface p-6 animate-fadeInUp">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-accent-teal" /> Patient Profile
        </h3>
        <span className="badge-teal">Clinical Snapshot</span>
      </div>

      {!patientId?.trim() && (
        <p className="mt-3 text-sm text-slate-500">Enter a patient ID to load patient details.</p>
      )}

      {loading && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-accent-teal/30 border-t-accent-teal rounded-full animate-spin" />
          Loading patient profile...
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {!loading && !error && patient && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 stagger-children">
          {statCards.map((card) => (
            <article
              key={card.label}
              className="card-surface p-4 group hover:border-accent-teal/20 transition-all duration-300 animate-fadeInUp"
            >
              <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500`}>
                <card.icon className={`w-4 h-4 ${card.color} group-hover:scale-110 transition-transform`} />
                {card.label}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-200">{card.value}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}