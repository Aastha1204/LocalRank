"use client";

import { useEffect, useState } from "react";

const WEEKS = ["W1", "W2", "W3", "W4"];
const METRICS = [
  { k: "Profile views", v: 3240, d: "+38%", series: [610, 740, 880, 1010], icon: "👀" },
  { k: "Calls", v: 214, d: "+52%", series: [38, 49, 58, 69], icon: "📞" },
  { k: "Direction requests", v: 167, d: "+41%", series: [31, 38, 44, 54], icon: "🧭" },
  { k: "Website clicks", v: 289, d: "+64%", series: [52, 66, 78, 93], icon: "🖱️" },
];

function Count({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / 1300);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [to]);
  return <>{v.toLocaleString("en-IN")}</>;
}

export default function MonthlyReport() {
  const [i, setI] = useState(0);
  const [grow, setGrow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGrow(true), 150); return () => clearTimeout(t); }, []);
  const m = METRICS[i];
  const max = Math.max(...m.series);

  return (
    <div>
      <p className="mx-auto w-fit rounded-full bg-saffron px-4 py-1.5 text-xs font-extrabold text-ink">Mock data · Live data after Google API approval</p>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {METRICS.map((x, idx) => (
          <button key={x.k} onClick={() => { setI(idx); setGrow(false); setTimeout(() => setGrow(true), 60); }}
            className={`card p-5 text-left transition hover:-translate-y-1 ${i === idx ? "!border-2 !border-sky-500 shadow-xl" : ""}`}>
            <span className="text-2xl">{x.icon}</span>
            <p className="mt-1 text-3xl font-black tabular-nums text-sky-950"><Count to={x.v} /></p>
            <p className="text-sm font-semibold text-ink/60">{x.k}</p>
            <p className="mt-1 text-sm font-extrabold text-green-600">▲ {x.d} vs last month</p>
          </button>
        ))}
      </div>

      <div className="card mt-6 p-6">
        <h2 className="text-xl font-extrabold text-sky-950">{m.k} by week</h2>
        <div className="mt-6 flex h-56 items-end gap-4 sm:gap-8" role="img" aria-label={`${m.k} by week: ${m.series.join(", ")}`}>
          {m.series.map((s, idx) => (
            <div key={idx} className="flex flex-1 flex-col items-center justify-end gap-2">
              <span className="text-sm font-extrabold tabular-nums">{s}</span>
              <div className="w-full rounded-t-xl bg-gradient-to-t from-sky-600 to-emerald-400 transition-all duration-1000 ease-out" style={{ height: grow ? `${(s / max) * 85}%` : "0%", transitionDelay: `${idx * 120}ms` }} />
              <span className="text-xs font-bold text-ink/50">{WEEKS[idx]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[["⭐", "Reviews gained", "+19", "Rating 4.1 → 4.7"], ["📝", "Posts published", "8", "2 per week"], ["💬", "Review replies", "27", "Avg reply time 11 hrs"]].map(([ic, k, v, s]) => (
          <div key={k} className="card flex items-center gap-4 p-5">
            <span className="text-3xl">{ic}</span>
            <div><p className="text-2xl font-black text-sky-950">{v}</p><p className="text-sm font-bold">{k}</p><p className="text-xs text-ink/55">{s}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
