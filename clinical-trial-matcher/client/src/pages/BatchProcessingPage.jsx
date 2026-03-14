import { useState } from "react";
import { Upload, Layers, Loader2, Download, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { fetchRecommendations, fetchAllTrials } from "../services/api";

export default function BatchProcessingPage() {
  const [file, setFile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setError("");
    setResults([]);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        setError("CSV file is empty or missing data rows.");
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const parsedPatients = lines.slice(1).map(line => {
        const values = line.split(',');
        const patient = {};
        headers.forEach((header, index) => {
          patient[header] = values[index]?.trim() || "";
        });
        return patient;
      });
      setPatients(parsedPatients);
    };
    reader.onerror = () => setError("Failed to read the file.");
    reader.readAsText(uploadedFile);
  };

  const processBatch = async () => {
    if (!patients.length) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: patients.length });
    setResults([]);
    setError("");

    try {
      const trialsRes = await fetchAllTrials();
      const allTrials = trialsRes.trials || [];
      if (!allTrials.length) throw new Error("No trials available in the database.");

      const batchResults = [];
      let currentIdx = 0;

      for (const p of patients) {
        currentIdx++;
        setProgress({ current: currentIdx, total: patients.length });

        try {
          const formattedPatient = {
            patientId: p.patientid || p.id || `PAT-${currentIdx}`,
            age: Number(p.age) || 0,
            gender: p.gender || "Unknown",
            location: p.location || "",
            conditions: (p.conditions || "").split(";").filter(Boolean),
            medications: (p.medications || "").split(";").filter(Boolean),
          };

          const res = await fetchRecommendations({ patient: formattedPatient, trials: allTrials });
          const bestMatch = (res.recommendations && res.recommendations.length > 0) 
            ? res.recommendations[0] 
            : null;

          batchResults.push({
            ...formattedPatient,
            bestTrialId: bestMatch ? bestMatch.trialId : "No Match",
            bestScore: bestMatch ? bestMatch.score : 0,
          });
        } catch (err) {
          batchResults.push({
            patientId: p.patientid || p.id || `PAT-${currentIdx}`,
            error: "Failed to process"
          });
        }
      }

      setResults(batchResults);
    } catch (err) {
      setError(err.message || "Failed to process the batch.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResults = () => {
    if (!results.length) return;
    const headers = ["Patient ID", "Age", "Gender", "Top Trial Match", "Match Score", "Status"];
    const rows = results.map(r => [
      r.patientId, r.age, r.gender, r.bestTrialId || "N/A", r.bestScore || 0, r.error ? "Error" : "Success"
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `batch_match_results.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="rounded-2xl p-6 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.06), rgba(99,102,241,0.04), rgba(139,92,246,0.03))', border: '1px solid rgba(20,184,166,0.08)' }}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                <Layers className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Batch Patient Matching</h1>
            </div>
            <p className="text-sm text-slate-400 max-w-xl">Upload a CSV file of multiple patients to generate AI-driven trial matches for all of them simultaneously. Download the aggregated results when finished.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1 space-y-6">
          <div className="rounded-2xl p-6" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-4">Upload CSV Data</p>
            
            <div className="relative group">
              <input type="file" accept=".csv" onChange={handleFileUpload} disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" />
              <div className={`rounded-xl border-2 border-dashed p-8 text-center transition-all ${file ? 'border-teal-500/30 bg-teal-500/5' : 'border-white/[0.08] bg-white/[0.02] group-hover:border-white/[0.15]'}`}>
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-teal-400 mb-2" />
                    <p className="text-sm font-bold text-slate-200">{file.name}</p>
                    <p className="text-xs text-slate-400">{patients.length} patients detected</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-slate-300 transition-colors" />
                    <p className="text-sm font-medium text-slate-300">Click or drag CSV file here</p>
                    <p className="text-xs text-slate-500">Columns: patientId,age,gender,location,conditions</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <button type="button" onClick={processBatch} disabled={!file || isProcessing || patients.length === 0}
              className="mt-6 w-full btn-glow px-4 py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing {progress.current} / {progress.total}...</>
              ) : (
                <><Layers className="w-4 h-4" /> Process {patients.length > 0 ? patients.length : ''} Patients</>
              )}
            </button>
            
            {isProcessing && (
              <div className="mt-4 h-1.5 rounded-full w-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.1)' }}>
                <div className="h-full bg-teal-400 transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="rounded-2xl p-6 h-full flex flex-col" style={{ background: 'rgba(10,15,28,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Batch Results</p>
              {results.length > 0 && (
                <button type="button" onClick={downloadResults} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-400 hover:bg-teal-400/10 transition-colors border border-teal-400/20">
                  <Download className="w-3.5 h-3.5" /> Export All
                </button>
              )}
            </div>

            {results.length === 0 && !isProcessing && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-xl" style={{ border: '1px dashed rgba(255,255,255,0.05)' }}>
                <Layers className="w-12 h-12 text-slate-500/30 mb-4" />
                <p className="text-slate-400 font-medium">No results yet</p>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">Upload a CSV and click process to generate batches of trial recommendations.</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b justify-between border-white/[0.04]">
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4">Patient ID</th>
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4">Age / Gender</th>
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4">Top Trial</th>
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4">Match Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-200">{r.patientId}</td>
                        <td className="py-3 px-4 text-slate-400 text-sm">{r.age} - {r.gender}</td>
                        <td className="py-3 px-4">
                          {r.error ? (
                            <span className="text-red-400 text-sm">Error</span>
                          ) : (
                            <span className="text-teal-400 text-sm font-bold">{r.bestTrialId}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {!r.error && (
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-white/[0.03] border border-white/[0.05] text-white">
                              {r.bestScore}%
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
