"use client";

import { useEffect, useRef, useState } from "react";
import { CP, TESTS } from "@/lib/careplus";

const BEFORE = { score: 52, reviews: 41, rating: 4.1, photos: 3, services: [] as string[], posts: 0, replies: "0 of 41", hours: "Mon-Sat only", desc: "" };
const AFTER = {
  score: 91, reviews: 118, rating: 4.7, photos: 25, services: TESTS.slice(0, 5).map((t) => `${t.name} · ${t.price}`), posts: 8, replies: "100% in 48h", hours: "Open 7 days, 7 AM - 8 PM",
  desc: "Trusted pathology lab on Manpada Road, Dombivli East. Thyroid, diabetes and full body checkups with reports on WhatsApp in 6 hours. Home sample collection across Dombivli & Kalyan.",
};

function useNum(target: number) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const from = cur.current, t0 = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / 700);
      cur.current = from + (target - from) * (1 - Math.pow(1 - p, 3));
      setV(cur.current);
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target]);
  return v;
}

export default function BeforeAfter() {
  const [after, setAfter] = useState(false);
  const d = after ? AFTER : BEFORE;
  const score = Math.round(useNum(d.score));
  const reviews = Math.round(useNum(d.reviews));
  const rating = useNum(d.rating);
  const photos = Math.round(useNum(d.photos));
  const col = score >= 80 ? "text-green-600" : score >= 60 ? "text-saffron-dark" : "text-red-600";

  return (
    <div>
      <div className="mx-auto flex w-fit items-center rounded-full bg-sky-950 p-1 shadow-lg" role="tablist" aria-label="Before or after">
        {[["Before", false], ["After 7 days", true]].map(([l, v]) => (
          <button key={String(l)} role="tab" aria-selected={after === v} onClick={() => setAfter(v as boolean)}
            className={`rounded-full px-6 py-2.5 font-extrabold transition ${after === v ? (v ? "bg-emerald-400 text-sky-950" : "bg-red-400 text-sky-950") : "text-white/70 hover:text-white"}`}>{l}</button>
        ))}
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
        {/* mock Google profile */}
        <article className="card overflow-hidden transition-all duration-500">
          <div className={`grid h-40 place-items-center bg-gradient-to-br transition-all duration-700 ${after ? "from-sky-400 to-emerald-300" : "from-slate-200 to-slate-300"}`}>
            <div className="flex gap-2">
              {Array.from({ length: Math.min(photos, 6) }, (_, i) => (
                <span key={i} className="h-20 w-20 rounded-xl bg-white/70 shadow ring-2 ring-white" style={{ animation: `rise .4s ${i * 60}ms both` }} />
              ))}
              {photos < 4 && <span className="self-center pl-2 text-sm font-bold text-slate-500">Only {photos} photos</span>}
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-black">{CP.name}</h2>
            <p className="font-semibold text-saffron-dark">★ {rating.toFixed(1)} <span className="text-ink/55">({reviews} reviews)</span> · Pathology lab</p>
            <p className={`mt-1 text-sm font-semibold ${after ? "text-green-700" : "text-red-600"}`}>{d.hours}</p>
            <div className="mt-4 flex gap-2 text-sm font-bold">
              {["Call", "Directions", "Website", "Message"].map((b) => <span key={b} className={`rounded-full px-3 py-1.5 ring-1 ${b === "Website" && !after ? "bg-slate-100 text-slate-400 ring-slate-200 line-through" : "text-sky-700 ring-sky-200"}`}>{b}</span>)}
            </div>
            <h3 className="mt-5 text-xs font-bold uppercase tracking-widest text-ink/45">About</h3>
            <p className={`mt-1 min-h-12 text-sm ${d.desc ? "text-ink/80" : "italic text-red-500"}`}>{d.desc || "No description added."}</p>
            <h3 className="mt-5 text-xs font-bold uppercase tracking-widest text-ink/45">Services</h3>
            {d.services.length ? (
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">{d.services.map((s, i) => <li key={s} className="rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-semibold" style={{ animation: `rise .4s ${i * 70}ms both` }}>{s}</li>)}</ul>
            ) : <p className="mt-1 text-sm italic text-red-500">No services listed.</p>}
            <h3 className="mt-5 text-xs font-bold uppercase tracking-widest text-ink/45">Latest post & review reply</h3>
            {after ? (
              <div className="mt-2 space-y-2 text-sm">
                <p className="rounded-lg bg-emerald-50 p-3"><b>This week:</b> Full body checkup ₹1,499 (72 tests). Home collection free above ₹999. Book on WhatsApp.</p>
                <p className="rounded-lg bg-sky-50 p-3"><b>Owner reply:</b> Thank you Mrs. Kulkarni! Glad your thyroid report reached you on time. We are here whenever you need us.</p>
              </div>
            ) : <p className="mt-1 text-sm italic text-red-500">No posts. No owner replies.</p>}
          </div>
        </article>

        {/* score card */}
        <aside className="space-y-4">
          <div className="card p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-ink/45">LocalRank score</p>
            <p className={`text-7xl font-black tabular-nums transition-colors ${col}`}>{score}</p>
            <p className="text-sm font-semibold text-ink/50">out of 100</p>
            <p className="mt-2 text-lg font-extrabold text-green-700 h-7">{after ? `+${AFTER.score - BEFORE.score} points` : ""}</p>
          </div>
          <div className="card space-y-2 p-5 text-sm font-semibold">
            <Row k="Reviews" v={reviews} />
            <Row k="Photos" v={photos} />
            <Row k="Posts / month" v={d.posts} />
            <Row k="Review replies" v={d.replies} />
          </div>
          <p className="text-center text-xs text-ink/50">Illustrative demo profile. Fictional business. No ranking guarantee.</p>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | number }) {
  return <div className="flex justify-between border-b border-ink/10 pb-2 last:border-0 last:pb-0"><span className="text-ink/60">{k}</span><span className="font-extrabold">{v}</span></div>;
}
