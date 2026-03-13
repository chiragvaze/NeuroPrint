import { useMemo, useState } from "react";
import { createPatient, uploadPatientFile } from "../services/api";
import {
  hasIdentifiableKeys,
  normalizePatient,
  parsePatientUploadFile
} from "../utils/patientUploadParsers";
import { Upload, FileText, Users, AlertCircle, CheckCircle2 } from "lucide-react";

const EMPTY_FORM = {
  patientId: "",
  age: "",
  gender: "",
  conditions: "",
  medications: "",
  location: ""
};

export default function PatientUploadPage() {
  const [mode, setMode] = useState("bulk");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewPatients, setPreviewPatients] = useState([]);
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const previewRows = useMemo(() => previewPatients.slice(0, 10), [previewPatients]);

  function onFormChange(event) {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  async function onFileChange(event) {
    const file = event.target.files?.[0];
    setError("");
    setMessage("");

    if (!file) {
      setSelectedFile(null);
      setPreviewPatients([]);
      return;
    }

    try {
      const parsed = await parsePatientUploadFile(file);
      if (hasIdentifiableKeys(parsed)) {
        throw new Error("Identifiable columns detected. Remove name, phone, email, and similar fields.");
      }

      setSelectedFile(file);
      setPreviewPatients(parsed);
    } catch (parseError) {
      setSelectedFile(null);
      setPreviewPatients([]);
      setError(parseError.message || "Failed to parse file.");
    }
  }

  async function submitManualEntry(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = normalizePatient(formState);
      await createPatient(payload);
      setMessage("Patient record created successfully.");
      setFormState(EMPTY_FORM);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to create patient record.");
    } finally {
      setLoading(false);
    }
  }

  async function submitFileUpload() {
    if (!selectedFile) {
      setError("Select a CSV or JSON file first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await uploadPatientFile(selectedFile);
      setMessage(`Uploaded ${response.count} patient records successfully.`);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to upload patient file.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="card-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Patient Upload Workspace</h2>
            <p className="mt-1 text-sm text-slate-400">Bulk upload or manually add anonymized patient profiles.</p>
          </div>
          <div className="inline-flex rounded-xl p-1" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
            <button
              type="button"
              onClick={() => setMode("bulk")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                mode === "bulk"
                  ? "bg-accent-teal/15 text-accent-teal"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Upload className="w-4 h-4" /> Bulk Upload
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                mode === "manual"
                  ? "bg-accent-teal/15 text-accent-teal"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" /> Manual Entry
            </button>
          </div>
        </div>
      </section>

      {mode === "bulk" ? (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
          <article className="card-surface p-6 animate-fadeInUp">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-accent-teal" /> Bulk File Upload
            </h3>
            <p className="mt-1 text-sm text-slate-400">Accepted formats: CSV and JSON. Upload one file at a time.</p>

            <label className="upload-zone mt-4">
              <input type="file" accept=".csv,.json" onChange={onFileChange} className="hidden" />
              <div className="p-3 rounded-xl bg-accent-teal/10 mb-3">
                <Upload className="w-8 h-8 text-accent-teal" />
              </div>
              <p className="text-sm font-semibold text-slate-200">Choose CSV/JSON file</p>
              <p className="mt-1 text-xs text-slate-500">No personal identifiers allowed</p>
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="card-surface p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Selected File
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-200">{selectedFile?.name || "None"}</p>
              </div>
              <div className="card-surface p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Parsed Records
                </p>
                <p className="mt-1 text-sm font-semibold text-accent-teal">{previewPatients.length}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={submitFileUpload}
              disabled={loading}
              className="mt-4 btn-glow w-full"
            >
              {loading ? "Uploading..." : "Upload Patients"}
            </button>
          </article>

          <article className="card-surface p-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg font-semibold text-slate-100">Parsed Data Preview</h3>
            <p className="mt-1 text-sm text-slate-400">Showing the first 10 parsed records before upload.</p>

            {previewRows.length === 0 ? (
              <div className="mt-4 card-surface p-6 text-sm text-slate-500 text-center">
                No parsed records yet.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-xl border border-surface-border">
                <table className="min-w-full text-sm table-dark">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left">patientId</th>
                      <th className="px-3 py-3 text-left">age</th>
                      <th className="px-3 py-3 text-left">conditions</th>
                      <th className="px-3 py-3 text-left">location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((patient, index) => (
                      <tr key={`${patient.patientId}-${index}`}>
                        <td className="px-3 py-2.5 font-semibold text-slate-200">{patient.patientId}</td>
                        <td className="px-3 py-2.5">{patient.age}</td>
                        <td className="px-3 py-2.5">{patient.conditions.join(", ")}</td>
                        <td className="px-3 py-2.5">{patient.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </section>
      ) : (
        <section className="card-surface p-6 animate-fadeInUp">
          <h3 className="text-lg font-semibold text-slate-100">Manual Patient Entry</h3>
          <p className="mt-1 text-sm text-slate-400">Create one anonymized patient profile manually.</p>

          <form onSubmit={submitManualEntry} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input name="patientId" placeholder="Patient ID" value={formState.patientId} onChange={onFormChange} required className="input-dark" />
            <input name="age" type="number" placeholder="Age" value={formState.age} onChange={onFormChange} required className="input-dark" />
            <input name="gender" placeholder="Gender" value={formState.gender} onChange={onFormChange} required className="input-dark" />
            <input name="location" placeholder="Location" value={formState.location} onChange={onFormChange} required className="input-dark" />
            <input name="conditions" placeholder="Conditions (comma-separated)" value={formState.conditions} onChange={onFormChange} className="input-dark md:col-span-2" />
            <input name="medications" placeholder="Medications (comma-separated)" value={formState.medications} onChange={onFormChange} className="input-dark md:col-span-2 xl:col-span-3" />

            <button type="submit" disabled={loading} className="btn-glow md:col-span-2 xl:col-span-3">
              {loading ? "Saving..." : "Save Patient"}
            </button>
          </form>
        </section>
      )}

      {/* Status messages */}
      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-accent-teal/30 bg-accent-teal/10 px-4 py-3 text-sm text-teal-300 animate-fadeInUp">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-accent-rose/30 bg-accent-rose/10 px-4 py-3 text-sm text-red-300 animate-fadeInUp">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
