"use client";

import { useState } from "react";

type Booking = { id: string; name: string; phone: string; service: string; date: string; slot: string | null; home: boolean; address: string | null; status: string; created_at: string };
const STATUSES = ["new", "confirmed", "done", "cancelled"];
const TONE: Record<string, string> = { new: "bg-blue-100 text-blue-800", confirmed: "bg-emerald-100 text-emerald-800", done: "bg-slate-200 text-slate-700", cancelled: "bg-red-100 text-red-700" };

export default function BookingsAdmin() {
  const [key, setKey] = useState("");
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function load(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/careplus/admin", { headers: { "x-admin-key": key } });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || "Failed."); setRows(null); } else setRows(j.bookings);
    } catch { setErr("Network error."); }
    setBusy(false);
  }

  async function setStatus(id: string, status: string) {
    setRows((rs) => rs?.map((b) => (b.id === id ? { ...b, status } : b)) ?? null);
    await fetch("/api/careplus/admin", { method: "PATCH", headers: { "x-admin-key": key, "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
  }

  if (!rows) {
    return (
      <form onSubmit={load} className="card mx-auto mt-8 max-w-sm space-y-3 p-6">
        <label className="block text-sm font-bold">Admin key
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)} required autoComplete="off" className="mt-1 h-12 w-full rounded-xl border border-sky-200 px-3 outline-none focus:ring-2 focus:ring-sky-400" />
        </label>
        {err && <p role="alert" className="text-sm font-semibold text-red-600">{err}</p>}
        <button disabled={busy} className="btn btn-dark w-full">{busy ? "Checking…" : "View bookings"}</button>
      </form>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-bold">{rows.length} bookings</p>
        <button onClick={() => load()} className="text-sm font-bold text-sky-700 hover:underline">↻ Refresh</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-sky-50 text-xs uppercase tracking-wide text-sky-950/60">
            <tr><th className="px-4 py-3">Patient</th><th>Test</th><th>When</th><th>Where</th><th>Status</th><th className="pr-4 text-right">Reply</th></tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-t border-sky-100 align-top">
                <td className="px-4 py-3 font-bold">{b.name}<span className="block text-xs font-medium text-sky-950/55">{b.phone}</span></td>
                <td>{b.service}</td>
                <td>{b.date}<span className="block text-xs text-sky-950/55">{b.slot}</span></td>
                <td>{b.home ? `Home: ${b.address}` : "Lab visit"}</td>
                <td>
                  <select value={b.status} onChange={(e) => setStatus(b.id, e.target.value)} aria-label={`Status for ${b.name}`} className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${TONE[b.status]}`}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="pr-4 text-right">
                  <a href={`https://wa.me/${b.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${b.name}, your ${b.service} booking at CarePlus on ${b.date}${b.slot ? ` (${b.slot})` : ""} is confirmed.`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-wa px-3 py-1.5 text-xs">WhatsApp</a>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sky-950/50">No bookings yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
