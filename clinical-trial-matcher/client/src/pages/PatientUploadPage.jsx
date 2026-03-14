import { useMemo, useState } from "react";
import { createPatient, uploadPatientFile } from "../services/api";
import {
  hasIdentifiableKeys,
  normalizePatient,
  parsePatientUploadFile
} from "../utils/patientUploadParsers";
import { Upload, FileText, Users, AlertCircle, CheckCircle2, CloudUpload, PenLine, ShieldCheck, ArrowRight, Sparkles, FileUp, ListChecks } from "lucide-react";

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
  const [dragOver, setDragOver] = useState(false);

  const previewRows = useMemo(() => previewPatients.slice(0, 10), [previewPatients]);

  function onFormChange(event) {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  async function processFile(file) {
    setError(""); setMessage("");
    if (!file) { setSelectedFile(null); setPreviewPatients([]); return; }
    try {
      const parsed = await parsePatientUploadFile(file);
      if (hasIdentifiableKeys(parsed)) {
        throw new Error("Identifiable columns detected. Remove name, phone, email fields.");
      }
      setSelectedFile(file);
      setPreviewPatients(parsed);
    } catch (parseError) {
      setSelectedFile(null); setPreviewPatients([]);
      setError(parseError.message || "Failed to parse file.");
    }
  }

  async function onFileChange(event) {
    await processFile(event.target.files?.[0]);
  }

  function onDrop(e) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  }

  async function submitManualEntry(event) {
    event.preventDefault();
    setLoading(true); setError(""); setMessage("");
    try {
      const payload = normalizePatient(formState);
      await createPatient(payload);
      setMessage("Patient record created successfully."); setFormState(EMPTY_FORM);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to create patient record.");
    } finally { setLoading(false); }
  }

  async function submitFileUpload() {
    if (!selectedFile) { setError("Select a CSV or JSON file first."); return; }
    setLoading(true); setError(""); setMessage("");
    try {
      const response = await uploadPatientFile(selectedFile);
      setMessage(`Uploaded ${response.count} patient records successfully.`);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to upload patient file.");
    } finally { setLoading(false); }
  }

  /* Which step is the user on? */
  const step = !selectedFile ? 1 : previewPatients.length > 0 && !message ? 2 : message ? 3 : 2;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ═══ Header Banner ═══ */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(20,184,166,0.04), rgba(139,92,246,0.03))', border: '1px solid rgba(99,102,241,0.08)' }}>
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Data Ingestion</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">Patient Upload Workspace</h2>
            <p className="text-sm text-slate-400 mt-1">Import anonymized patient records for AI-powered trial matching.</p>
          </div>

          {/* Mode switcher */}
          <div className="flex rounded-xl p-1" style={{ background: 'rgba(6,10,19,0.8)', border: '1px solid rgba(255,255,255,0.04)' }}>
            {[
              { id: "bulk", label: "Bulk Upload", icon: CloudUpload },
              { id: "manual", label: "Manual Entry", icon: PenLine }
            ].map((tab) => (
              <button key={tab.id} type="button" onClick={() => setMode(tab.id)}
                className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-all duration-300 flex items-center gap-2 ${
                  mode === tab.id
                    ? "text-teal-400" : "text-slate-400 hover:text-slate-300"
                }`}
                style={mode === tab.id ? { background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.1)' } : { border: '1px solid transparent' }}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-indigo-400/[0.03] blur-3xl pointer-events-none" />
      </div>

      {/* ═══ Step Indicator (Bulk mode) ═══ */}
      {mode === "bulk" && (
        <div className="flex items-center gap-0">
          {[
            { n: 1, label: "Select File", icon: FileUp },
            { n: 2, label: "Preview Data", icon: ListChecks },
            { n: 3, label: "Upload", icon: CheckCircle2 }
          ].map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${step >= s.n ? "text-teal-400" : "text-slate-300"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s.n
                    ? "bg-teal-400/10 text-teal-400 border border-teal-400/15"
                    : "bg-white/[0.02] text-slate-300 border border-white/[0.04]"
                }`} style={step >= s.n ? { boxShadow: '0 0 10px rgba(20,184,166,0.15)' } : {}}>
                  {step > s.n ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
                </div>
                <span className="text-[12px] font-medium hidden sm:inline">{s.label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-px mx-2 ${step > s.n ? "bg-teal-400/20" : "bg-white/[0.04]"}`} />}
            </div>
          ))}
        </div>
      )}

      {mode === "bulk" ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
          {/* Upload Card */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-4">File Upload</p>

            <label 
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl px-6 py-16 text-center transition-all duration-300 relative overflow-hidden ${
                dragOver ? "border-teal-400/40 bg-teal-400/[0.03]" : "border-white/[0.06] hover:border-white/[0.1]"
              }`}
              style={{ border: '2px dashed' }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}>
              <input type="file" accept=".csv,.json" onChange={onFileChange} className="hidden" />
              <div className={`p-5 rounded-2xl mb-4 transition-all duration-300 ${dragOver ? "scale-110" : ""}`}
                   style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.1)' }}>
                <CloudUpload className={`w-10 h-10 ${dragOver ? "text-teal-300" : "text-teal-400"}`} />
              </div>
              <p className="text-sm font-semibold text-slate-300">
                {dragOver ? "Drop your file here" : "Drag & drop or click to browse"}
              </p>
              <p className="mt-1.5 text-xs text-slate-300">CSV, JSON · Max 50MB · No personal identifiers</p>
            </label>

            {/* File + Records stats */}
            <div className="mt-5 grid gap-3 grid-cols-2">
              <div className="rounded-xl p-4" style={{ background: 'rgba(6,10,19,0.5)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">File</span>
                </div>
                <p className="text-[13px] font-semibold text-slate-300 truncate">{selectedFile?.name || "None"}</p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(6,10,19,0.5)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Records</span>
                </div>
                <p className="text-2xl font-black text-teal-400">{previewPatients.length}</p>
              </div>
            </div>

            <button type="button" onClick={submitFileUpload} disabled={loading || !selectedFile}
              className="mt-5 btn-glow w-full flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Uploading...</> : <>Upload Patients <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>

          {/* Preview Card */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Data Preview</p>
              {previewRows.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-teal-400 bg-teal-400/10 border border-teal-400/15">{previewRows.length} rows</span>
              )}
            </div>

            {previewRows.length === 0 ? (
              <div className="rounded-xl p-10 text-center" style={{ background: 'rgba(6,10,19,0.4)', border: '1px dashed rgba(255,255,255,0.04)' }}>
                <FileText className="w-10 h-10 text-slate-400/50 mx-auto mb-3" />
                <p className="text-sm text-slate-300">No data to preview</p>
                <p className="text-xs text-slate-400 mt-1">Upload a CSV or JSON file to see parsed results.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                <table className="min-w-full text-sm table-dark">
                  <thead>
                    <tr>
                      <th>Patient ID</th>
                      <th>Age</th>
                      <th>Conditions</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((patient, index) => (
                      <tr key={`${patient.patientId}-${index}`}>
                        <td className="font-semibold text-slate-200">{patient.patientId}</td>
                        <td className="tabular-nums">{patient.age}</td>
                        <td className="max-w-[180px] truncate">{patient.conditions.join(", ")}</td>
                        <td>{patient.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ═══ Manual Entry ═══ */
        <div className="rounded-2xl p-6" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-4">Manual Patient Entry</p>
          <form onSubmit={submitManualEntry} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              { name: "patientId", placeholder: "PAT-3001", label: "Patient ID" },
              { name: "age", placeholder: "45", label: "Age", type: "number" },
              { name: "gender", placeholder: "Male / Female", label: "Gender" },
              { name: "location", placeholder: "Mumbai, India", label: "Location" },
              { name: "conditions", placeholder: "Diabetes, Hypertension", label: "Conditions", span: "md:col-span-2" },
              { name: "medications", placeholder: "Metformin, Insulin", label: "Medications", span: "md:col-span-2 xl:col-span-3" },
            ].map((field) => (
              <div key={field.name} className={field.span || ""}>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-300 mb-1.5">{field.label}</label>
                <input name={field.name} type={field.type || "text"} placeholder={field.placeholder} value={formState[field.name]} onChange={onFormChange}
                  required={!['conditions', 'medications'].includes(field.name)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-white/[0.02] border border-white/[0.05] text-slate-200 placeholder:text-slate-400 outline-none focus:border-teal-500/30 focus:ring-2 focus:ring-teal-500/10 transition-all" />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-glow md:col-span-2 xl:col-span-3 flex items-center justify-center gap-2">
              {loading ? "Saving..." : "Save Patient Record"} {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}

      {/* Status messages */}
      {message && (
        <div className="flex items-center gap-2.5 rounded-xl px-5 py-3.5 text-sm text-teal-300 animate-fadeIn"
             style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.12)' }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {message}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl px-5 py-3.5 text-sm text-red-300 animate-fadeIn"
             style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.12)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
