"use client";

import { useState } from "react";
import { CP, TESTS } from "@/lib/careplus";

const SLOTS = ["7-9 AM", "9-11 AM", "11 AM-1 PM", "4-6 PM", "6-8 PM"];
const HOME_SLOTS = ["6-8 AM", "8-10 AM"];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function BookingForm({ defaultService = "", defaultHome = false }: { defaultService?: string; defaultHome?: boolean }) {
  const options = ["Thyroid Profile (T3, T4, TSH) · ₹449", ...TESTS.map((t) => `${t.name} · ${t.price}`)];
  const [service, setService] = useState(defaultService || options[0]);
  const [home, setHome] = useState(defaultHome);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(() => iso(new Date(Date.now() + 86400000)));
  const [slot, setSlot] = useState("");
  const [address, setAddress] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { saved: boolean }>(null);

  const slots = home ? HOME_SLOTS : SLOTS;
  const min = iso(new Date());

  function summary() {
    return `Hi CarePlus, I booked: ${service} on ${date}${slot ? `, ${slot}` : ""}${home ? ` (home collection: ${address})` : ""}. Name: ${name}.`;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!slot) return setErr("Please pick a time slot.");
    setBusy(true);
    try {
      const r = await fetch("/api/careplus/booking", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, service, date, slot, home, address, website: "" }),
      });
      const j = await r.json();
      if (!r.ok) setErr(j.error || "Something went wrong.");
      else setDone({ saved: !!j.saved });
    } catch {
      setErr("Network error. Please try again or WhatsApp us.");
    }
    setBusy(false);
  }

  if (done) {
    return (
      <div className="card rise p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-3xl text-white">✓</div>
        <h3 className="mt-4 text-2xl font-black text-sky-950">Booking received, {name.split(" ")[0]}!</h3>
        <p className="mt-2 text-sky-950/70">{service}<br />{new Date(date + "T00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} · {slot}{home && " · Home collection"}</p>
        <p className="mt-3 text-sm text-sky-950/60">We will confirm on WhatsApp shortly. Demo — fictional business, no real appointment is made.</p>
        <a href={`https://wa.me/${CP.wa}?text=${encodeURIComponent(summary())}`} target="_blank" rel="noopener noreferrer" className="btn btn-wa mt-5">Confirm on WhatsApp</a>
        <button onClick={() => { setDone(null); setSlot(""); }} className="mt-3 block w-full text-sm font-bold text-sky-700 hover:underline">Book another test</button>
      </div>
    );
  }

  const field = "h-12 w-full rounded-xl border border-sky-200 bg-white px-3 font-semibold text-sky-950 outline-none focus:ring-2 focus:ring-sky-400";
  return (
    <form onSubmit={submit} className="card space-y-4 p-6" aria-label="Book a test">
      <div>
        <h3 className="text-2xl font-black text-sky-950">Book a test</h3>
        <p className="text-sm text-sky-950/60">Takes 30 seconds. Reports on WhatsApp in 6 hours.</p>
      </div>
      <label className="block text-sm font-bold text-sky-950">Test
        <select value={service} onChange={(e) => setService(e.target.value)} className={`${field} mt-1`}>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-sky-100 p-1 text-sm font-extrabold" role="group" aria-label="Where">
        {[["Visit lab", false], ["Home collection", true]].map(([l, v]) => (
          <button key={String(l)} type="button" aria-pressed={home === v} onClick={() => { setHome(v as boolean); setSlot(""); }}
            className={`rounded-lg py-2 transition ${home === v ? "bg-white text-sky-900 shadow" : "text-sky-900/60"}`}>{l}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold text-sky-950">Your name
          <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} autoComplete="name" className={`${field} mt-1`} />
        </label>
        <label className="block text-sm font-bold text-sky-950">Phone / WhatsApp
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" maxLength={18} autoComplete="tel" className={`${field} mt-1`} />
        </label>
      </div>
      <label className="block text-sm font-bold text-sky-950">Date
        <input type="date" value={date} min={min} onChange={(e) => setDate(e.target.value)} required className={`${field} mt-1`} />
      </label>
      <div>
        <p className="text-sm font-bold text-sky-950">Time slot</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {slots.map((s) => (
            <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)}
              className={`rounded-full px-4 py-2 text-sm font-bold ring-1 transition ${slot === s ? "bg-sky-600 text-white ring-sky-600" : "bg-white text-sky-900 ring-sky-200 hover:bg-sky-50"}`}>{s}</button>
          ))}
        </div>
      </div>
      {home && (
        <label className="block text-sm font-bold text-sky-950">Area / address (Kalyan, Dombivli…)
          <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} placeholder="Flat, building, area" className={`${field} mt-1`} />
        </label>
      )}
      {err && <p role="alert" className="text-sm font-semibold text-red-600">{err}</p>}
      <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? "Booking…" : "Confirm booking"}</button>
    </form>
  );
}
