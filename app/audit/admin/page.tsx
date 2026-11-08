import type { Metadata } from "next";
import LocalRankShell from "@/components/audit/LocalRankShell";
import LeadsTable from "@/components/audit/LeadsTable";

export const metadata: Metadata = { title: "Audit leads | LocalRank", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <LocalRankShell active="admin">
      <section className="section min-h-[70vh] bg-paper">
        <div className="wrap">
          <p className="eyebrow">Admin · demo</p>
          <h1 className="h2 mt-1">Audit leads</h1>
          <p className="mt-2 max-w-2xl text-ink/70">Every prospect who unlocks a report lands here. Run an audit on the public page and watch a new row appear. (Demo stores leads in this browser; the live version uses Supabase.)</p>
          <LeadsTable />
        </div>
      </section>
    </LocalRankShell>
  );
}
