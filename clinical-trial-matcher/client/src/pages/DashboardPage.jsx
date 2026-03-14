import TrialMatchChart from "../components/TrialMatchChart";
import useTrialMatches from "../hooks/useTrialMatches";

export default function DashboardPage() {
  const { matches, loading } = useTrialMatches();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-400">Patients Processed</p>
          <p className="mt-2 text-3xl font-bold">128</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-400">Trials Indexed</p>
          <p className="mt-2 text-3xl font-bold">42</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-400">High Confidence Matches</p>
          <p className="mt-2 text-3xl font-bold">23</p>
        </article>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">Loading matches...</div>
      ) : (
        <TrialMatchChart data={matches} />
      )}
    </div>
  );
}
