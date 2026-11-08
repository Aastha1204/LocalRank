"use client";

import { useEffect, useState } from "react";
import { LEADS_KEY, SEED_LEADS } from "@/lib/localrank";
import type { Lead } from "@/lib/localrank";

const STATUSES: Lead["status"][] = ["new", "contacted", "proposal", "won"];
const STYLE: Record<Lead["status"], string> = {
  new: "bg-blue-100 text-blue-800", contacted: "bg-saffron/30 text-saffron-dark", proposal: "bg-purple-100 text-purple-800", won: "bg-green-100 text-green-800",
};

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [filter, setFilter] = useState<"all" | Lead["status"]>("all");

  useEffect(() => {
    // localStorage is only readable after mount; read it in a timer callback
    const t = setTimeout(() => {
      let l: Lead[] = SEED_LEADS;
      try { l = JSON.parse(localStorage.getItem(LEADS_KEY) || "null") ?? SEED_LEADS; } catch { /* use seed */ }
      setLeads(l);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  function setStatus(id: string, status: Lead["status"]) {
    const next = (leads ?? []).map((l) => (l.id === id ? { ...l, status } : l));
    setLeads(next);
    try { localStorage.setItem(LEADS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }

  if (!leads) return <p className="mt-8 text-ink/50">Loading…</p>;
  const shown = leads.filter((l) => filter === "all" || l.status === filter);
  const count = (s: Lead["status"]) => leads.filter((l) => l.status === s).length;
  const avg = leads.length ? Math.round(leads.reduce((a, l) => a + l.score, 0) / leads.length) : 0;

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Tile k={String(leads.length)} v="Total leads" />
        {STATUSES.map((s) => <Tile key={s} k={String(count(s))} v={s} tone={s} />)}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-4 py-1.5 text-sm font-bold capitalize transition ${filter === s ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-ink/15 hover:bg-mist"}`}>{s}</button>
        ))}
        <span className="ml-auto text-sm font-semibold text-ink/55">Avg score {avg}/100</span>
      </div>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-wide text-ink/55">
            <tr><th className="px-4 py-3">Business</th><th>Area</th><th>Score</th><th>Contact</th><th>Status</th><th className="pr-4 text-right">Action</th></tr>
          </thead>
          <tbody>
            {shown.map((l) => (
              <tr key={l.id} className="border-t border-ink/10">
                <td className="px-4 py-3 font-bold">{l.business}<span className="block text-xs font-medium text-ink/50">{new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></td>
                <td>{l.area}</td>
                <td><span className={`rounded-full px-2.5 py-0.5 font-extrabold ${l.score < 50 ? "bg-red-100 text-red-700" : l.score < 70 ? "bg-saffron/30 text-saffron-dark" : "bg-green-100 text-green-700"}`}>{l.score}</span></td>
                <td>{l.name}<span className="block text-xs text-ink/50">{l.whatsapp}</span></td>
                <td>
                  <select value={l.status} onChange={(e) => setStatus(l.id, e.target.value as Lead["status"])} aria-label={`Status for ${l.business}`}
                    className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${STYLE[l.status]}`}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="pr-4 text-right">
                  <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${l.name}, I ran a free Google visibility check for ${l.business}. It scored ${l.score}/100. Sharing the one-page report here.`)}`}
                    target="_blank" rel="noopener noreferrer" className="btn btn-wa px-3 py-1.5 text-xs">WhatsApp</a>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink/50">No leads in this status.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tile({ k, v, tone }: { k: string; v: string; tone?: Lead["status"] }) {
  return (
    <div className="card p-4">
      <p className="text-3xl font-black tabular-nums">{k}</p>
      <p className={`mt-1 inline-block rounded-full px-2 text-xs font-bold capitalize ${tone ? STYLE[tone] : "text-ink/55"}`}>{v}</p>
    </div>
  );
}
