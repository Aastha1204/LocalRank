"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AREAS, LEADS_KEY, SEED_LEADS, competitorsFor, scorePlace, searchPlaces, verdict } from "@/lib/localrank";
import type { Activity, Lead, Place, Score } from "@/lib/localrank";
import { DEFAULT_WA_MESSAGE, waLink } from "@/config/site";
import { CheckIcon, PinIcon, WhatsAppIcon, XIcon, SparkIcon } from "@/components/Icons";

type Stage = "search" | "pick" | "scan" | "result";

const EXAMPLES = ["CarePlus Diagnostics", "Sai Dental Clinic", "Iron Pulse Fitness", "Glam Studio Salon", "Bright Future Classes"];
const SCAN_STEPS = ["Finding your Google listing", "Reading profile fields", "Scanning competitors within 3 km", "Checking your website", "Calculating your score"];

/* ---------- small hooks ---------- */

function useCountUp(target: number, ms = 1400) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = Date.now();
    const a = from.current;
    // setInterval (not rAF) so the count still finishes if the tab is throttled in the background
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / ms);
      const cur = a + (target - a) * (1 - Math.pow(1 - p, 3));
      from.current = cur;
      setV(cur);
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, ms]);
  return Math.round(v);
}

function useTypewriter(words: string[]) {
  const [txt, setTxt] = useState("");
  useEffect(() => {
    let w = 0, i = 0, del = false;
    const id = setInterval(() => {
      const word = words[w];
      if (!del) { i++; if (i > word.length + 12) del = true; }
      else { i -= 2; if (i <= 0) { del = false; i = 0; w = (w + 1) % words.length; } }
      setTxt(word.slice(0, Math.max(0, Math.min(i, word.length))));
    }, 70);
    return () => clearInterval(id);
  }, [words]);
  return txt;
}

/* ---------- visual pieces ---------- */

function Gauge({ score, size = 220, dark = false }: { score: number; size?: number; dark?: boolean }) {
  const n = useCountUp(score);
  const v = verdict(score);
  const r = 90, c = 2 * Math.PI * r, arc = c * 0.75;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 220 220" className="h-full w-full -rotate-[225deg]">
        <circle cx="110" cy="110" r={r} fill="none" stroke={dark ? "rgba(255,255,255,.12)" : "rgba(31,35,64,.08)"} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${arc} ${c}`} />
        <circle cx="110" cy="110" r={r} fill="none" stroke={v.color} strokeWidth="16" strokeLinecap="round"
          strokeDasharray={`${(arc * n) / 100} ${c}`} style={{ filter: `drop-shadow(0 0 8px ${v.color}88)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-6xl font-black tabular-nums ${dark ? "text-white" : "text-ink"}`}>{n}</span>
        <span className={`text-sm font-semibold ${dark ? "text-white/60" : "text-ink/50"}`}>out of 100</span>
        <span className="mt-1 rounded-full px-3 py-0.5 text-xs font-bold text-white" style={{ background: v.color }}>{v.label}</span>
      </div>
    </div>
  );
}

function Bar({ label, got, max, delay = 0 }: { label: string; got: number; max: number; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW((got / max) * 100), 120 + delay); return () => clearTimeout(t); }, [got, max, delay]);
  const pct = got / max;
  const col = pct >= 0.75 ? "#15803d" : pct >= 0.45 ? "#f2a33a" : "#dc2626";
  return (
    <div>
      <div className="flex justify-between text-sm font-semibold"><span>{label}</span><span className="tabular-nums">{got}/{max}</span></div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${w}%`, background: col }} />
      </div>
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-teal-dark" : "bg-ink/20"}`}>
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

const Attribution = () => (
  <p className="text-xs text-ink/50">Demo data shown. Live version uses Google Places API (New) data with Google Maps attribution.</p>
);

/* ---------- main ---------- */

export default function AuditApp() {
  const [stage, setStage] = useState<Stage>("search");
  const [q, setQ] = useState("");
  const [area, setArea] = useState<string>("Dombivli East");
  const [matches, setMatches] = useState<Place[]>([]);
  const [place, setPlace] = useState<Place | null>(null);
  const [act, setAct] = useState<Activity>({ replies: false, posts: false });
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [modal, setModal] = useState(false);
  const typed = useTypewriter(EXAMPLES);
  const topRef = useRef<HTMLDivElement>(null);

  const comps = useMemo(() => (place ? competitorsFor(place) : []), [place]);
  const score: Score | null = useMemo(() => (place ? scorePlace(place, comps, act) : null), [place, comps, act]);

  const go = (s: Stage) => { setStage(s); setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30); };

  function search(e?: React.FormEvent, query = q) {
    e?.preventDefault();
    if (query.trim().length < 2) return;
    setQ(query);
    const m = searchPlaces(query, area);
    setMatches(m);
    go("pick");
  }

  function confirm(p: Place) {
    setPlace(p); setAct({ replies: false, posts: false }); setUnlocked(false); setStep(0); setElapsed(0);
    go("scan");
  }

  useEffect(() => {
    if (stage !== "scan") return;
    const t0 = performance.now();
    const ids = SCAN_STEPS.map((_, i) => setTimeout(() => setStep(i + 1), 500 + i * 650));
    const done = setTimeout(() => { setElapsed((performance.now() - t0) / 1000); setStage("result"); }, 500 + SCAN_STEPS.length * 650 + 250);
    return () => { ids.forEach(clearTimeout); clearTimeout(done); };
  }, [stage]);

  function reset() { setQ(""); setPlace(null); go("search"); }

  return (
    <div ref={topRef} className="scroll-mt-4">
      {stage === "search" && <Landing q={q} setQ={setQ} area={area} setArea={setArea} typed={typed} onSubmit={search} onPick={(n) => search(undefined, n)} />}
      {stage === "pick" && <Picker q={q} matches={matches} onPick={confirm} onBack={() => go("search")} />}
      {stage === "scan" && place && <Scan place={place} step={step} />}
      {stage === "result" && place && score && (
        <Results place={place} comps={comps} score={score} act={act} setAct={setAct} elapsed={elapsed}
          unlocked={unlocked} onUnlock={() => setModal(true)} onReset={reset} />
      )}
      {modal && place && score && (
        <LeadModal place={place} score={score.total} onClose={() => setModal(false)} onDone={() => { setUnlocked(true); setModal(false); }} />
      )}
    </div>
  );
}

/* ---------- 1. landing ---------- */

function Landing(props: {
  q: string; setQ: (v: string) => void; area: string; setArea: (v: string) => void; typed: string;
  onSubmit: (e: React.FormEvent) => void; onPick: (n: string) => void;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="lr-blob left-[-8rem] top-[-6rem] h-96 w-96 bg-teal/30" />
      <div className="lr-blob bottom-[-10rem] right-[-6rem] h-[28rem] w-[28rem] bg-saffron/25 [animation-delay:-6s]" />
      <div className="lr-grid absolute inset-0 opacity-40" />
      <div className="wrap relative grid items-center gap-12 px-4 pb-20 pt-14 lg:grid-cols-[1.1fr_.9fr] lg:pt-20">
        <div>
          <p className="rise inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal">
            <span className="h-2 w-2 animate-ping rounded-full bg-teal" /> Free · 10 second audit
          </p>
          <h1 className="rise rise-2 mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            How visible is your business on <span className="bg-gradient-to-r from-saffron to-teal bg-clip-text text-transparent">Google Maps?</span>
          </h1>
          <p className="rise rise-3 mt-5 max-w-xl text-lg text-white/80">
            Type your business name. Get a score out of 100, see which nearby competitors are ahead, and a 5-point fix plan you can finish in 7 days.
          </p>

          <form onSubmit={props.onSubmit} className="rise rise-3 mt-8 rounded-2xl bg-white p-2 text-ink shadow-2xl shadow-black/30">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Business name</span>
                <PinIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-dark" />
                <input value={props.q} onChange={(e) => props.setQ(e.target.value)} required minLength={2} maxLength={80}
                  placeholder={props.typed || "Your business name"}
                  className="h-14 w-full rounded-xl bg-mist/60 pl-12 pr-3 text-base font-semibold outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-saffron" />
              </label>
              <label>
                <span className="sr-only">Area</span>
                <select value={props.area} onChange={(e) => props.setArea(e.target.value)}
                  className="h-14 w-full rounded-xl bg-mist/60 px-3 text-base font-semibold outline-none focus:ring-2 focus:ring-saffron sm:w-44">
                  {AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </label>
              <button className="btn btn-primary h-14 px-7 text-base">Check my score →</button>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-white/60">Try:</span>
            {EXAMPLES.slice(0, 4).map((e) => (
              <button key={e} onClick={() => props.onPick(e)} className="rounded-full border border-white/25 px-3 py-1 font-semibold text-white/90 transition hover:bg-white/15">{e}</button>
            ))}
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            {["No signup to see your score", "Clinics · Labs · Gyms · Salons · Classes", "Mumbai · Kalyan · Dombivli · Thane"].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><CheckIcon className="h-4 w-4 text-teal" />{t}</li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="lr-float rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">Sample report</p>
            <div className="mt-2 flex items-center gap-4">
              <Gauge score={52} size={150} dark />
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><XIcon className="h-4 w-4 text-red-400" /> Only 3 photos</p>
                <p className="flex items-center gap-2"><XIcon className="h-4 w-4 text-red-400" /> No Sunday hours</p>
                <p className="flex items-center gap-2"><XIcon className="h-4 w-4 text-red-400" /> No owner replies</p>
                <p className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-teal" /> Phone & address</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-white/10 p-3 text-sm">
              <p className="font-bold">3 clinics nearby have 2-3x more reviews</p>
              <p className="text-white/60">Fix plan: 5 steps, 7 days → projected 86/100</p>
            </div>
          </div>
          <div className="lr-float absolute -bottom-5 -left-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-xl [animation-delay:-2s] sm:-left-8">
            <p className="text-xs font-bold text-ink/50">Audit leads this week</p>
            <p className="text-2xl font-black">+27 <span className="text-sm text-teal-dark">↑ 18%</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 2. picker ---------- */

function Picker({ q, matches, onPick, onBack }: { q: string; matches: Place[]; onPick: (p: Place) => void; onBack: () => void }) {
  return (
    <section className="section bg-paper">
      <div className="wrap max-w-3xl">
        <button onClick={onBack} className="text-sm font-bold text-teal-dark hover:underline">← Search again</button>
        <h2 className="h2 mt-3">Which one is yours?</h2>
        <p className="mt-2 text-ink/70">We found {matches.length} listings for <b>“{q}”</b>. Confirm the right one so we score the correct profile.</p>
        <div className="mt-6 space-y-3">
          {matches.map((m, i) => (
            <button key={m.id} onClick={() => onPick(m)} style={{ animationDelay: `${i * 90}ms` }}
              className="rise card group flex w-full items-center gap-4 p-4 text-left transition hover:-translate-y-0.5 hover:border-saffron hover:shadow-xl">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal/20 text-teal-dark"><PinIcon className="h-6 w-6" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg font-extrabold">{m.name}</span>
                <span className="block truncate text-sm text-ink/60">{m.category} · {m.address}</span>
                <span className="mt-1 block text-sm font-semibold text-saffron-dark">★ {m.rating.toFixed(1)} <span className="text-ink/50">({m.reviews} reviews)</span></span>
              </span>
              <span className="btn btn-dark px-4 py-2 text-sm opacity-90 group-hover:bg-saffron group-hover:text-ink">This is mine</span>
            </button>
          ))}
        </div>
        <div className="mt-6"><Attribution /></div>
      </div>
    </section>
  );
}

/* ---------- 3. scan ---------- */

function Scan({ place, step }: { place: Place; step: number }) {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-ink px-4 py-20 text-white">
      <div className="lr-grid absolute inset-0 opacity-30" />
      <div className="wrap relative grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow !text-teal">Auditing</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">{place.name}</h2>
          <p className="mt-1 text-white/60">{place.address}</p>
          <ul className="mt-8 space-y-3">
            {SCAN_STEPS.map((s, i) => {
              const done = step > i, active = step === i;
              return (
                <li key={s} className={`flex items-center gap-3 text-lg font-semibold transition-opacity ${done || active ? "opacity-100" : "opacity-35"}`}>
                  <span className={`grid h-7 w-7 place-items-center rounded-full ${done ? "bg-teal text-ink" : "border-2 border-white/40"}`}>
                    {done ? <CheckIcon className="h-4 w-4" /> : active ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-saffron" /> : null}
                  </span>
                  {s}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          {[1, 0.7, 0.4].map((s, i) => <div key={i} className="absolute inset-0 m-auto rounded-full border border-teal/40" style={{ width: `${s * 100}%`, height: `${s * 100}%` }} />)}
          <div className="lr-radar absolute inset-0 rounded-full" />
          {[[30, 25], [68, 38], [45, 70], [22, 62], [75, 72]].map(([x, y], i) => (
            <span key={i} className="absolute h-3 w-3 animate-pulse rounded-full bg-saffron shadow-[0_0_14px_#f2a33a]" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.35}s`, opacity: step >= 3 ? 1 : 0.15 }} />
          ))}
          <span className="absolute inset-0 m-auto grid h-12 w-12 place-items-center rounded-full bg-teal text-ink shadow-[0_0_30px_#3cc4b6]"><PinIcon className="h-6 w-6" /></span>
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. results ---------- */

function Results(p: {
  place: Place; comps: ReturnType<typeof competitorsFor>; score: Score; act: Activity; setAct: (a: Activity) => void;
  elapsed: number; unlocked: boolean; onUnlock: () => void; onReset: () => void;
}) {
  const { place, comps, score } = p;
  const v = verdict(score.total);
  const bestComp = [...comps].sort((a, b) => b.reviews - a.reviews)[0];
  const ahead = comps.filter((c) => c.reviews > place.reviews).length;
  const groups = ["Profile completeness", "Reviews", "Photos", "Website & local SEO", "Activity & engagement"] as const;
  const projected = useCountUp(score.projected, 900);

  return (
    <div>
      {/* header band */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="lr-blob right-[-6rem] top-[-6rem] h-80 w-80 bg-teal/25" />
        <div className="wrap relative grid items-center gap-8 px-4 py-12 md:grid-cols-[auto_1fr]">
          <div className="mx-auto"><Gauge score={score.total} dark /></div>
          <div>
            <button onClick={p.onReset} className="text-sm font-bold text-teal hover:underline">← Audit another business</button>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">{place.name}</h2>
            <p className="text-white/60">{place.category} · {place.area} {p.elapsed > 0 && <>· audited in <b className="text-saffron">{p.elapsed.toFixed(1)}s</b></>}</p>
            <p className="mt-4 text-lg text-white/90">{v.note}</p>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center sm:max-w-lg">
              <Stat k={`${ahead} of ${comps.length}`} v="rivals have more reviews" />
              <Stat k={`#${score.rank}`} v="by review count nearby" />
              <Stat k={`${projected}`} v="score after 5 fixes" accent />
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="wrap grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          {/* left col */}
          <div className="space-y-8">
            <div className="card p-6">
              <h3 className="text-xl font-extrabold">Score breakdown</h3>
              <div className="mt-5 space-y-4">
                {score.groups.map((g, i) => <Bar key={g.name} label={g.name} got={g.got} max={g.max} delay={i * 120} />)}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-extrabold">Checklist</h3>
              <div className="mt-4 divide-y divide-ink/10">
                {groups.map((g) => (
                  <div key={g} className="py-3">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-ink/45">{g}</p>
                    {score.checks.filter((c) => c.group === g).map((c) => {
                      const ok = c.max === 0 ? c.detail !== "No services listed" : c.got >= c.max - 0.5;
                      const part = !ok && c.got > 0;
                      const tip = c.max === 0;
                      return (
                        <div key={c.id} className="flex items-start gap-3 py-1.5">
                          <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-white ${ok ? "bg-green-600" : part ? "bg-saffron" : "bg-red-500"}`}>
                            {ok ? <CheckIcon className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-tight">{c.label} {tip && <span className="ml-1 rounded bg-teal/20 px-1.5 text-[10px] font-bold uppercase text-teal-dark">tip</span>}</p>
                            <p className="truncate text-sm text-ink/60">{c.detail}</p>
                          </div>
                          {!tip && <span className="text-sm font-bold tabular-nums text-ink/60">{Math.round(c.got)}/{c.max}</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-extrabold">Activity (owner-confirmed)</h3>
              <p className="text-sm text-ink/60">Google does not expose these publicly, so in v1 you tick them. Watch the score move.</p>
              <div className="mt-4 space-y-3">
                <label className="flex items-center justify-between gap-3 rounded-xl bg-mist/70 p-3 font-semibold">Owner replies to reviews <Toggle label="Owner replies to reviews" on={p.act.replies} onChange={(replies) => p.setAct({ ...p.act, replies })} /></label>
                <label className="flex items-center justify-between gap-3 rounded-xl bg-mist/70 p-3 font-semibold">Posts on Google in the last 30 days <Toggle label="Recent posts" on={p.act.posts} onChange={(posts) => p.setAct({ ...p.act, posts })} /></label>
              </div>
            </div>
          </div>

          {/* right col */}
          <div className="space-y-8">
            <div className="card overflow-hidden">
              <div className="p-6 pb-3">
                <h3 className="text-xl font-extrabold">Nearby competitors</h3>
                <p className="text-sm text-ink/60">Same category, within ~3 km of you.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-mist text-xs uppercase tracking-wide text-ink/55">
                    <tr><th className="px-4 py-2">Business</th><th className="px-2 py-2">Rating</th><th className="px-2 py-2">Reviews</th><th className="px-2 py-2">Photos</th></tr>
                  </thead>
                  <tbody>
                    <tr className="bg-saffron/15 font-bold">
                      <td className="px-4 py-3">{place.name} <span className="ml-1 rounded bg-ink px-1.5 py-0.5 text-[10px] text-white">YOU</span></td>
                      <td className="px-2">★ {place.rating.toFixed(1)}</td><td className="px-2">{place.reviews}</td><td className="px-2">{place.photos}</td>
                    </tr>
                    {comps.map((c) => (
                      <tr key={c.id} className="border-t border-ink/10">
                        <td className="px-4 py-3"><span className="font-semibold">{c.name}</span><span className="block text-xs text-ink/50">{c.km} km away</span></td>
                        <td className={`px-2 font-semibold ${c.rating > place.rating ? "text-red-600" : "text-green-700"}`}>★ {c.rating.toFixed(1)}</td>
                        <td className={`px-2 font-semibold ${c.reviews > place.reviews ? "text-red-600" : "text-green-700"}`}>{c.reviews}</td>
                        <td className={`px-2 font-semibold ${c.photos > place.photos ? "text-red-600" : "text-green-700"}`}>{c.photos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {bestComp.reviews > place.reviews && (
                <p className="m-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">
                  {bestComp.name} has {(bestComp.reviews / Math.max(1, place.reviews)).toFixed(1)}x your reviews. That is who shows above you in “{place.category.toLowerCase()} near me”.
                </p>
              )}
            </div>

            <div className="card border-2 border-saffron p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold">Top 5 fixes</h3>
                <span className="rounded-full bg-saffron px-3 py-1 text-xs font-extrabold">7-day plan</span>
              </div>
              <ol className="mt-4 space-y-3">
                {score.fixes.map((f, i) => (
                  <li key={f.title} className="rise flex gap-3" style={{ animationDelay: `${i * 100}ms` }}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink font-extrabold text-white">{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-bold leading-tight">{f.title} <span className="whitespace-nowrap text-sm font-extrabold text-green-700">+{f.gain} pts</span></p>
                      <p className={`text-sm text-ink/65 ${p.unlocked || i < 2 ? "" : "select-none blur-[5px]"}`}>{f.how}</p>
                      <p className="text-xs font-semibold text-teal-dark">Done by day {f.eta}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {score.fixes.length === 0 && <p className="mt-3 font-semibold text-green-700">Nothing major to fix. Nice profile!</p>}
              <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-900">
                Projected score after fixes: <b>{score.projected}/100</b>. We never promise a rank, only a complete, active profile.
              </p>
              {!p.unlocked ? (
                <button onClick={p.onUnlock} className="btn btn-primary mt-4 w-full">🔓 Unlock full PDF report on WhatsApp</button>
              ) : (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-100 p-3 text-sm font-bold text-green-900"><CheckIcon className="h-5 w-5" /> Report sent to your WhatsApp and email (demo)</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {p.unlocked && <ReportPreview place={place} score={score} comps={comps} />}

      <section className="section bg-ink text-center text-white">
        <div className="wrap max-w-2xl">
          <h2 className="h2">We fix your top 5 issues in 7 days.</h2>
          <p className="mt-3 text-white/75">Then keep your profile active every month: posts, review replies, photos and a monthly report.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={waLink(`${DEFAULT_WA_MESSAGE} My Google visibility score for ${place.name} is ${score.total}/100.`)} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><WhatsAppIcon /> Book a free 15-minute call</a>
            <Link href="/careplus" className="btn btn-ghost text-white">See a finished example →</Link>
          </div>
        </div>
      </section>
      <div className="bg-paper px-4 py-4 text-center"><Attribution /></div>
    </div>
  );
}

function Stat({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${accent ? "bg-saffron text-ink" : "bg-white/10"}`}>
      <p className="text-2xl font-black tabular-nums">{k}</p>
      <p className={`text-[11px] font-semibold leading-tight ${accent ? "text-ink/70" : "text-white/60"}`}>{v}</p>
    </div>
  );
}

/* ---------- printable report ---------- */

function ReportPreview({ place, score, comps }: { place: Place; score: Score; comps: ReturnType<typeof competitorsFor> }) {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return (
    <section className="section bg-mist">
      <div className="wrap max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-extrabold">Your PDF report</h3>
          <button onClick={() => window.print()} className="btn btn-dark">⬇ Download / Print PDF</button>
        </div>
        <article className="report-print card bg-white p-8">
          <header className="flex items-start justify-between border-b-4 border-saffron pb-4">
            <div><p className="text-xs font-bold uppercase tracking-widest text-teal-dark">Neovia AI · LocalRank</p><h4 className="text-2xl font-black">Local Visibility Report</h4><p className="text-sm text-ink/60">{place.name} · {place.area} · {today}</p></div>
            <div className="text-right"><p className="text-5xl font-black">{score.total}</p><p className="text-xs font-bold text-ink/50">/ 100</p></div>
          </header>
          <h5 className="mt-5 font-extrabold">Score summary</h5>
          <table className="mt-2 w-full text-sm"><tbody>
            {score.groups.map((g) => <tr key={g.name} className="border-b border-ink/10"><td className="py-1.5">{g.name}</td><td className="text-right font-bold">{g.got}/{g.max}</td></tr>)}
          </tbody></table>
          <h5 className="mt-5 font-extrabold">Competitors nearby</h5>
          <table className="mt-2 w-full text-sm"><tbody>
            {comps.map((c) => <tr key={c.id} className="border-b border-ink/10"><td className="py-1.5">{c.name}</td><td>★ {c.rating}</td><td>{c.reviews} reviews</td><td className="text-right">{c.photos} photos</td></tr>)}
          </tbody></table>
          <h5 className="mt-5 font-extrabold">Your 7-day fix plan</h5>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
            {score.fixes.map((f) => <li key={f.title}><b>{f.title}</b> (+{f.gain} pts, day {f.eta}). {f.how}</li>)}
          </ol>
          <p className="mt-5 rounded-lg bg-mist p-3 text-xs text-ink/70">Projected score after fixes: {score.projected}/100. No ranking is guaranteed. Demo data; live reports use Google Places data with Google Maps attribution. neoviaai.in</p>
        </article>
      </div>
    </section>
  );
}

/* ---------- lead modal ---------- */

function LeadModal({ place, score, onClose, onDone }: { place: Place; score: number; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [phase, setPhase] = useState<"form" | "sending">("form");
  const [sent, setSent] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("Please enter your name.");
    if (!/^[+\d][\d\s-]{8,16}$/.test(wa.trim())) return setErr("Enter a valid WhatsApp number.");
    setErr(""); setPhase("sending");
    try {
      const lead: Lead = { id: crypto.randomUUID(), business: place.name, area: place.area, score, name: name.trim(), whatsapp: wa.trim(), status: "new", createdAt: new Date().toISOString() };
      const prev: Lead[] = JSON.parse(localStorage.getItem(LEADS_KEY) || "null") ?? SEED_LEADS;
      localStorage.setItem(LEADS_KEY, JSON.stringify([lead, ...prev]));
      fetch("/api/audit/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...lead, email, website: "" }) }).catch(() => {});
    } catch { /* storage unavailable: demo continues */ }
    [1, 2, 3].forEach((n) => setTimeout(() => setSent(n), n * 700));
    setTimeout(onDone, 3 * 700 + 700);
  }

  const items = ["Building your PDF report", "Sent on WhatsApp ✓", "Emailed copy ✓"];
  return (
    <div role="dialog" aria-modal="true" aria-label="Unlock report" className="fixed inset-0 z-50 grid place-items-center bg-ink/75 p-4 backdrop-blur-sm">
      <div className="rise card relative w-full max-w-md p-6">
        {phase === "form" ? (
          <form onSubmit={submit}>
            <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-ink/50 hover:text-ink"><XIcon className="h-5 w-5" /></button>
            <p className="eyebrow">Free report</p>
            <h3 className="mt-1 text-2xl font-black">Get the full report for {place.name}</h3>
            <p className="mt-1 text-sm text-ink/65">Score {score}/100, fix plan and competitor table as a branded PDF.</p>
            <div className="mt-4 space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus maxLength={80} className="h-12 w-full rounded-xl border border-ink/15 px-3 font-semibold outline-none focus:ring-2 focus:ring-saffron" />
              <input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="WhatsApp number" inputMode="tel" maxLength={18} className="h-12 w-full rounded-xl border border-ink/15 px-3 font-semibold outline-none focus:ring-2 focus:ring-saffron" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" type="email" maxLength={120} className="h-12 w-full rounded-xl border border-ink/15 px-3 font-semibold outline-none focus:ring-2 focus:ring-saffron" />
              {err && <p role="alert" className="text-sm font-semibold text-red-600">{err}</p>}
              <button className="btn btn-wa w-full"><WhatsAppIcon /> Send my report</button>
              <p className="text-center text-xs text-ink/50">Demo mode: nothing is actually sent. No spam, one report only.</p>
            </div>
          </form>
        ) : (
          <div className="py-4 text-center">
            <SparkIcon className="mx-auto h-10 w-10 text-saffron" />
            <h3 className="mt-2 text-xl font-black">Almost there…</h3>
            <ul className="mt-5 space-y-3 text-left">
              {items.map((t, i) => (
                <li key={t} className={`flex items-center gap-3 font-semibold transition-opacity ${sent >= i ? "opacity-100" : "opacity-30"}`}>
                  <span className={`grid h-6 w-6 place-items-center rounded-full ${sent > i ? "bg-green-600 text-white" : "border-2 border-ink/30"}`}>{sent > i && <CheckIcon className="h-3.5 w-3.5" />}</span>{t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
