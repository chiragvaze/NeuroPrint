import { useState } from "react";
import PatientUploadPage from "./pages/PatientUploadPage";
import TrialDatabasePage from "./pages/TrialDatabasePage";
import AppLayout from "./components/AppLayout";

export default function App() {
  const [activePage, setActivePage] = useState("patients");

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActivePage("patients")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            activePage === "patients"
              ? "bg-brand-500 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          Patient Data
        </button>
        <button
          type="button"
          onClick={() => setActivePage("trials")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            activePage === "trials"
              ? "bg-brand-500 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
        >
          Trial Database
        </button>
      </div>

      {activePage === "patients" ? <PatientUploadPage /> : <TrialDatabasePage />}
    </AppLayout>
  );
}
