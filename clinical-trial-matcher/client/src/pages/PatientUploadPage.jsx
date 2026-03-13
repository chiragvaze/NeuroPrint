import { useMemo, useState } from "react";
import { createPatient, uploadPatientFile } from "../services/api";
import {
  hasIdentifiableKeys,
  normalizePatient,
  parsePatientUploadFile
} from "../utils/patientUploadParsers";

const EMPTY_FORM = {
  patientId: "",
  age: "",
  gender: "",
  conditions: "",
  medications: "",
  location: ""
};

export default function PatientUploadPage() {
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
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Patient Data Module</h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload anonymized CSV or JSON records and preview parsed patients before storage.
        </p>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="file"
            accept=".csv,.json"
            onChange={onFileChange}
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={submitFileUpload}
            disabled={loading}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            Upload File
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Manual Patient Entry</h3>

        <form onSubmit={submitManualEntry} className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            name="patientId"
            placeholder="Patient ID"
            value={formState.patientId}
            onChange={onFormChange}
            required
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            name="age"
            type="number"
            placeholder="Age"
            value={formState.age}
            onChange={onFormChange}
            required
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            name="gender"
            placeholder="Gender"
            value={formState.gender}
            onChange={onFormChange}
            required
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            name="location"
            placeholder="Location"
            value={formState.location}
            onChange={onFormChange}
            required
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            name="conditions"
            placeholder="Conditions (comma-separated)"
            value={formState.conditions}
            onChange={onFormChange}
            className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2"
          />
          <input
            name="medications"
            placeholder="Medications (comma-separated)"
            value={formState.medications}
            onChange={onFormChange}
            className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60 md:col-span-2"
          >
            Save Patient
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Parsed Patient Data Preview</h3>
        <p className="mt-1 text-sm text-slate-600">Showing up to 10 parsed records from the selected file.</p>

        {previewRows.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No parsed records yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="px-3 py-2">patientId</th>
                  <th className="px-3 py-2">age</th>
                  <th className="px-3 py-2">gender</th>
                  <th className="px-3 py-2">conditions</th>
                  <th className="px-3 py-2">medications</th>
                  <th className="px-3 py-2">location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRows.map((patient, index) => (
                  <tr key={`${patient.patientId}-${index}`}>
                    <td className="px-3 py-2">{patient.patientId}</td>
                    <td className="px-3 py-2">{patient.age}</td>
                    <td className="px-3 py-2">{patient.gender}</td>
                    <td className="px-3 py-2">{patient.conditions.join(", ")}</td>
                    <td className="px-3 py-2">{patient.medications.join(", ")}</td>
                    <td className="px-3 py-2">{patient.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </section>
    </div>
  );
}
