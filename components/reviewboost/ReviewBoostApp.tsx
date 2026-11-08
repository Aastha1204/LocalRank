"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { CONTACT } from "@/config/site";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

const STAFF = ["Rohit", "Sneha", "Imran"] as const;

/* seeded 60-day history: 64 → 131 reviews */
function seed() {
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const days: number[] = [];
  let c = 64;
  for (let i = 0; i < 60; i++) {
    const target = 64 + ((131 - 64) * (i + 1)) / 60;
    c = i === 59 ? 131 : Math.max(c, Math.round(target + (rnd() - 0.5) * 2.2));
    days.push(c);
  }
  return days;
}

const REVIEWS = [
  { id: 1, who: "Priya M.", stars: 5, text: "Butter chicken and garlic naan were outstanding. Staff was warm and quick. Will come again with family!" },
  { id: 2, who: "Karan S.", stars: 1, text: "Waited 50 minutes for starters and the dal makhani was cold. Very disappointed for a Saturday night." },
  { id: 3, who: "Neha D.", stars: 4, text: "Great taste, but parking is a pain and the AC was a bit weak." },
];

function draftReply(r: (typeof REVIEWS)[number], tone: "English" | "Hinglish") {
  const first = r.who.split(" ")[0];
  if (r.stars >= 4) {
    return tone === "English"
      ? `Hi ${first}, thank you so much for the lovely words! We're thrilled you enjoyed the food and the service. ${r.stars === 4 ? "We'll look into the parking and AC points you raised. " : ""}Hope to welcome you and your family again soon. – Team Tandoor Tales`
      : `Hi ${first}, bahut shukriya! Khushi hui ki aapko khana aur service pasand aayi. ${r.stars === 4 ? "Parking aur AC wali baat par hum kaam karenge. " : ""}Jaldi milte hain, family ke saath zaroor aaiye! – Team Tandoor Tales`;
  }
  return tone === "English"
    ? `Hi ${first}, we're truly sorry about the long wait and the cold dal makhani — that's not the standard we hold ourselves to. Please call our manager on ${CONTACT.phone} so we can make this right. – Team Tandoor Tales`
    : `Hi ${first}, wait time aur thanda dal makhani ke liye hum dil se maafi chahte hain — yeh hamare standard ka nahi hai. Kripya manager ko ${CONTACT.phone} par call karein, hum isse theek karenge. – Team Tandoor Tales`;
}

function Stars({ n }: { n: number }) {
  return <span aria-label={`${n} stars`} className="text-amber-400">{"★".repeat(n)}<span className="text-white/20">{"★".repeat(5 - n)}</span></span>;
}

function useCount(target: number, run: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / 1400); setV(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return v;
}

function InView({ children, className = "" }: { children: (seen: boolean) => React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.2 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={className}>{children(seen)}</div>;
}

function Kpi({ label, value, suffix = "", seen, accent, tenths }: { label: string; value: number; suffix?: string; seen: boolean; accent?: string; tenths?: boolean }) {
  const n = useCount(value, seen);
  const v = tenths ? (n / 10).toFixed(1) : n;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur" style={{ transform: "translateZ(0)" }}>
      <p className={`text-3xl font-black ${accent ?? "text-white"}`}>{v}{suffix}</p>
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{label}</p>
    </div>
  );
}

/* ---------- Quick-send phone ---------- */
function QuickSend() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [staff, setStaff] = useState<(typeof STAFF)[number]>("Rohit");
  const [stage, setStage] = useState<"idle" | "sent" | "delivered" | "read" | "clicked">("idle");
  const [secs, setSecs] = useState<number | null>(null);
  const t0 = useRef<number | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const valid = name.trim().length > 1 && phone.replace(/\D/g, "").length >= 10;
  const send = () => {
    if (!valid) return;
    setSecs(+(((performance.now() - (t0.current ?? performance.now())) / 1000)).toFixed(1));
    setStage("sent");
    window.dispatchEvent(new Event("rb-send"));
    timers.current.push(window.setTimeout(() => setStage("delivered"), 900), window.setTimeout(() => setStage("read"), 2000));
  };
  const reset = () => { timers.current.forEach(clearTimeout); setStage("idle"); setName(""); setPhone(""); setSecs(null); t0.current = null; };
  const first = name.trim().split(" ")[0] || "Aarav";
  const ticks = stage === "sent" ? "✓" : "✓✓";

  return (
    <div className="mx-auto w-full max-w-[340px]">
      <div className="rounded-[2.4rem] border-[6px] border-[#0d0f1d] bg-[#0d0f1d] shadow-[0_30px_80px_-20px_rgba(60,196,182,.45)]">
        <div className="overflow-hidden rounded-[1.9rem] bg-white">
          {stage === "idle" ? (
            <div className="p-5">
              <div className="mb-4 flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lg">⭐</span><div><p className="text-sm font-black text-ink">ReviewBoost</p><p className="text-[11px] text-ink/50">Tandoor Tales · counter phone</p></div></div>
              <label className="text-xs font-bold text-ink/60" htmlFor="rb-name">Customer name</label>
              <input id="rb-name" value={name} onFocus={() => (t0.current ??= performance.now())} onChange={(e) => setName(e.target.value)} placeholder="Aarav Shah" className="mb-3 mt-1 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-ink outline-none focus:border-teal" />
              <label className="text-xs font-bold text-ink/60" htmlFor="rb-phone">WhatsApp number</label>
              <input id="rb-phone" inputMode="tel" value={phone} onFocus={() => (t0.current ??= performance.now())} onChange={(e) => setPhone(e.target.value)} placeholder="98200 12345" className="mb-3 mt-1 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-ink outline-none focus:border-teal" />
              <p className="text-xs font-bold text-ink/60">Served by</p>
              <div className="mb-4 mt-1 flex gap-2">
                {STAFF.map((s) => <button key={s} type="button" onClick={() => setStaff(s)} className={`flex-1 rounded-xl border px-2 py-2 text-sm font-bold transition ${staff === s ? "border-teal bg-teal/15 text-teal-dark" : "border-ink/15 text-ink/60"}`}>{s}</button>)}
              </div>
              <button type="button" disabled={!valid} onClick={send} className="w-full rounded-xl bg-[#15803d] py-3 font-black text-white transition enabled:hover:bg-[#116a34] disabled:opacity-40">Send review request →</button>
              <p className="mt-3 text-center text-[11px] text-ink/40">Customer consented at the counter · STOP honoured</p>
            </div>
          ) : (
            <div className="bg-[#0b141a]">
              <div className="flex items-center gap-2 bg-[#075e54] px-4 py-3 text-white"><span className="grid h-8 w-8 place-items-center rounded-full bg-saffron font-black text-ink">T</span><div><p className="text-sm font-bold leading-tight">Tandoor Tales</p><p className="text-[11px] text-white/70">Business account</p></div></div>
              <div className="min-h-[360px] space-y-2 p-3">
                <div className="rb-pop max-w-[88%] rounded-xl rounded-tl-none bg-[#005c4b] p-3 text-[13px] leading-snug text-[#e9edef]">
                  Hi {first} 👋 Thank you for dining with us at Tandoor Tales today! We hope you loved the meal. Would you share a quick review? It takes 20 seconds ⭐
                  <p className="mt-2 text-[11px] text-[#8696a0]">Reply STOP to stop messages</p>
                  <p className={`mt-1 text-right text-[11px] ${stage === "sent" || stage === "delivered" ? "text-[#8696a0]" : "text-[#53bdeb]"}`}>{ticks}</p>
                  <button type="button" onClick={() => setStage("clicked")} className="mt-2 w-full rounded-lg bg-[#103529] py-2 text-center text-sm font-bold text-[#53bdeb] transition hover:bg-[#164a38]">↗ Leave a Google review</button>
                </div>
                {stage === "clicked" && (
                  <div className="rb-pop rounded-xl bg-white p-3 text-ink">
                    <p className="text-[11px] font-bold text-ink/50">google.com/maps · Write a review</p>
                    <p className="mt-1 text-sm font-black">Tandoor Tales Family Restaurant</p>
                    <p className="text-2xl tracking-widest text-amber-400">★★★★★</p>
                    <p className="text-[11px] text-ink/50">Click logged via /r/aB3xK · review box opened directly, no searching</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-white/70">
        {stage === "idle" && <p>Type any name &amp; number, tap Send. Watch the 3D scene above react.</p>}
        {stage !== "idle" && (
          <>
            <p className="font-bold text-teal">⚡ Request sent in {secs}s {secs !== null && secs < 5 ? "— under 5 seconds ✓" : ""}</p>
            <p className="mt-1">Status: <b className="text-white">{stage}</b>{stage === "read" ? " — tap the button in the chat ↑" : ""}</p>
            <button type="button" onClick={reset} className="mt-2 rounded-full border border-white/25 px-4 py-1 text-xs font-bold text-white/80 hover:bg-white/10">Try again</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard() {
  const days = useMemo(seed, []);
  const W = 640, H = 220, PAD = 28;
  const min = 60, max = 135;
  const pts = days.map((v, i) => [PAD + (i / 59) * (W - PAD * 2), H - PAD - ((v - min) / (max - min)) * (H - PAD * 2)] as const);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[59][0]},${H - PAD} L${pts[0][0]},${H - PAD} Z`;
  const funnel: [string, number, string][] = [["Sent", 420, "bg-white/80"], ["Delivered", 401, "bg-sky-300"], ["Read", 318, "bg-teal"], ["Clicked", 160, "bg-saffron"]];
  const leaders = [["Sneha", 168, 46], ["Rohit", 152, 37], ["Imran", 100, 27]] as const;

  return (
    <InView>
      {(seen) => (
        <div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi seen={seen} label="Requests sent" value={420} />
            <Kpi seen={seen} label="Click-through" value={38} suffix="%" accent="text-saffron" />
            <Kpi seen={seen} label="Google rating" value={47} tenths suffix="★" accent="text-amber-400" />
            <Kpi seen={seen} label="Reviews (64 → 131)" value={131} accent="text-teal" />
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-3">
              <p className="mb-2 text-sm font-bold text-white">Google review count · last 60 days <span className="font-medium text-teal">+67</span></p>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Review count growing from 64 to 131 over 60 days">
                <defs>
                  <linearGradient id="rbg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#3cc4b6" stopOpacity=".5" /><stop offset="1" stopColor="#3cc4b6" stopOpacity="0" /></linearGradient>
                </defs>
                {[70, 100, 130].map((g) => { const y = H - PAD - ((g - min) / (max - min)) * (H - PAD * 2); return <g key={g}><line x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#fff" strokeOpacity=".08" /><text x={2} y={y + 4} fontSize="11" fill="#fff" fillOpacity=".4">{g}</text></g>; })}
                <path d={area} fill="url(#rbg)" style={{ opacity: seen ? 1 : 0, transition: "opacity 1.2s .4s" }} />
                <path d={line} fill="none" stroke="#3cc4b6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={seen ? 0 : 1} style={{ transition: "stroke-dashoffset 1.8s ease-out" }} />
                <circle cx={pts[59][0]} cy={pts[59][1]} r="5" fill="#f2a33a" />
                <text x={W - PAD - 4} y={pts[59][1] - 12} fontSize="13" fontWeight="800" fill="#f2a33a" textAnchor="end">131</text>
                <text x={PAD} y={H - 6} fontSize="11" fill="#fff" fillOpacity=".4">Day 1</text>
                <text x={W - PAD} y={H - 6} fontSize="11" fill="#fff" fillOpacity=".4" textAnchor="end">Day 60</text>
              </svg>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
              <p className="mb-3 text-sm font-bold text-white">Message funnel</p>
              <div className="space-y-3">
                {funnel.map(([l, v, c]) => (
                  <div key={l}>
                    <div className="flex justify-between text-xs text-white/70"><span>{l}</span><b className="text-white">{v}</b></div>
                    <div className="mt-1 h-3 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${c}`} style={{ width: seen ? `${(v / 420) * 100}%` : "0%", transition: "width 1.2s cubic-bezier(.2,.8,.2,1) .2s" }} /></div>
                  </div>
                ))}
              </div>
              <p className="mt-5 mb-2 text-sm font-bold text-white">Staff leaderboard</p>
              <ul className="space-y-2 text-sm">
                {leaders.map(([n, s, ctr], i) => (
                  <li key={n} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2"><span className="w-5 text-center">{["🥇", "🥈", "🥉"][i]}</span><b className="flex-1 text-white">{n}</b><span className="text-white/60">{s} sent</span><span className="rounded-full bg-saffron/20 px-2 py-0.5 text-xs font-bold text-saffron">{ctr}% click</span></li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">🔔 <b>WhatsApp alert to owner:</b> new 1★ review from Karan S. — reply drafted below.</p>
        </div>
      )}
    </InView>
  );
}

/* ---------- AI reply inbox ---------- */
function Inbox() {
  const [sel, setSel] = useState(1);
  const [tone, setTone] = useState<"English" | "Hinglish">("English");
  const [typed, setTyped] = useState("");
  const [copied, setCopied] = useState(false);
  const r = REVIEWS.find((x) => x.id === sel)!;
  const full = useMemo(() => draftReply(r, tone), [r, tone]);

  useEffect(() => {
    setTyped(""); setCopied(false);
    let i = 0;
    const id = window.setInterval(() => { i += 3; setTyped(full.slice(0, i)); if (i >= full.length) clearInterval(id); }, 18);
    return () => clearInterval(id);
  }, [full]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        {REVIEWS.map((x) => (
          <button key={x.id} type="button" onClick={() => setSel(x.id)} className={`w-full rounded-2xl border p-4 text-left transition ${sel === x.id ? "border-teal bg-teal/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
            <div className="flex items-center justify-between"><b className="text-white">{x.who}</b><Stars n={x.stars} /></div>
            <p className="mt-1 text-sm text-white/70">{x.text}</p>
          </button>
        ))}
        <p className="text-xs text-white/40">Places API returns the latest 5 reviews; full history and auto-posting need GBP API approval.</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <p className="font-black text-white">✨ AI reply draft</p>
          <div className="flex gap-1 rounded-full bg-white/10 p-1 text-xs font-bold">
            {(["English", "Hinglish"] as const).map((t) => <button key={t} type="button" onClick={() => setTone(t)} className={`rounded-full px-3 py-1 transition ${tone === t ? "bg-white text-ink" : "text-white/70"}`}>{t}</button>)}
          </div>
        </div>
        <p className="mt-4 min-h-[120px] text-[15px] leading-relaxed text-white/90">{typed}<span className="rb-caret" /></p>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={() => { navigator.clipboard?.writeText(full).catch(() => {}); setCopied(true); }} className="btn btn-primary px-5 py-2 text-sm">{copied ? "Copied ✓" : "Copy reply"}</button>
          <span className="text-xs text-white/50">Calm, specific, never argues.</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- QR standee ---------- */
function Standee() {
  const cells = useMemo(() => {
    let s = 11; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const n = 21; const out: boolean[] = [];
    const finder = (x: number, y: number) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (finder(x, y)) { const fx = x % 14 > 6 ? x - 14 : x, fy = y > 13 ? y - 14 : y; out.push(fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5)); }
      else out.push(rnd() > 0.52);
    }
    return out;
  }, []);
  const [tilt, setTilt] = useState({ x: -8, y: 14 });
  return (
    <div className="flex flex-col items-center gap-3" style={{ perspective: 900 }}>
      <div
        onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: -((e.clientY - r.top) / r.height - 0.5) * 24, y: ((e.clientX - r.left) / r.width - 0.5) * 34 }); }}
        onPointerLeave={() => setTilt({ x: -8, y: 14 })}
        className="w-64 rounded-3xl bg-gradient-to-b from-saffron to-[#d9811c] p-5 text-center shadow-[0_40px_60px_-20px_rgba(0,0,0,.6)] transition-transform duration-200"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transformStyle: "preserve-3d" }}
      >
        <p className="text-xs font-black uppercase tracking-widest text-ink/70" style={{ transform: "translateZ(30px)" }}>Tandoor Tales</p>
        <p className="mt-1 text-2xl font-black leading-tight text-ink" style={{ transform: "translateZ(50px)" }}>Loved your meal?<br />Scan to review ⭐</p>
        <div className="mx-auto mt-4 rounded-2xl bg-white p-3" style={{ transform: "translateZ(40px)" }}>
          <div className="grid grid-cols-[repeat(21,1fr)] gap-0 aspect-square">
            {cells.map((c, i) => <span key={i} className={c ? "bg-ink" : "bg-white"} />)}
          </div>
        </div>
        <p className="mt-3 text-[11px] font-bold text-ink/70" style={{ transform: "translateZ(20px)" }}>Opens the Google review box directly</p>
      </div>
      <p className="text-xs text-white/50">Hover to tilt · printable PDF from your brand kit</p>
    </div>
  );
}

/* ---------- Page ---------- */
export default function ReviewBoostApp() {
  const wa = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent("Hi, I saw the ReviewBoost demo. I'd like it for my business.")}`;
  const steps = [
    ["1", "Staff taps Send", "Name, number, who served. Under 5 seconds on a cheap Android."],
    ["2", "WhatsApp, 2 hrs later", "Polished thank-you + one tap to the Google review box."],
    ["3", "One gentle nudge", "Reminder after 48 hrs only if not clicked. Then it stops."],
    ["4", "Owner watches it grow", "Funnel, review count, staff leaderboard, AI replies."],
  ];
  return (
    <div className="rb-root bg-[#12152b] text-white">
      <style>{`
        .rb-root .rb-pop{animation:rbpop .45s cubic-bezier(.2,1.4,.4,1) both}
        @keyframes rbpop{from{opacity:0;transform:translateY(10px) scale(.94)}to{opacity:1;transform:none}}
        .rb-caret{display:inline-block;width:2px;height:1em;background:#3cc4b6;vertical-align:-2px;margin-left:2px;animation:rbblink 1s steps(2) infinite}
        @keyframes rbblink{50%{opacity:0}}
        .rb-card3d{transition:transform .25s ease,box-shadow .25s}
        .rb-card3d:hover{transform:translateY(-6px) rotateX(4deg);box-shadow:0 24px 40px -18px rgba(60,196,182,.5)}
        @media (prefers-reduced-motion:reduce){.rb-root *{animation:none!important;transition:none!important}}
      `}</style>

      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_30%,#2a3170_0%,#12152b_60%)]" />
        <Scene3D className="absolute inset-0 -z-0 opacity-45 md:opacity-80 lg:opacity-100" />
        <div className="wrap relative z-10 flex min-h-[88vh] flex-col justify-center px-4 py-20 pointer-events-none">
          <p className="rise inline-block w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-teal">Demo 02 · Google review automation</p>
          <h1 className="rise rise-2 mt-4 max-w-xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">Every customer. <span className="text-saffron">One tap.</span> More <span className="text-amber-400">★★★★★</span></h1>
          <p className="rise rise-3 mt-5 max-w-md text-lg text-white/75">ReviewBoost sends a friendly WhatsApp message after every visit with a one-tap link to your Google review box — and shows the owner reviews growing on one screen.</p>
          <div className="rise rise-3 pointer-events-auto mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#try" className="btn btn-primary">Try it on your phone →</a>
            <a href="/reviewboost/dashboard" className="btn btn-ghost text-white">Open dashboard prototype</a>
          </div>
          <p className="mt-6 text-xs text-white/40">Tandoor Tales Family Restaurant, Thane West — fictional demo business. Move your mouse: the scene is live 3D.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid gap-4 md:grid-cols-4" style={{ perspective: 1000 }}>
          {steps.map(([n, t, d]) => (
            <div key={n} className="rb-card3d rounded-2xl border border-white/10 bg-white/5 p-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-saffron font-black text-ink">{n}</span>
              <p className="mt-3 font-extrabold">{t}</p>
              <p className="mt-1 text-sm text-white/60">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="try" className="section bg-gradient-to-b from-transparent via-[#1a1f45] to-transparent">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-teal">3-minute script · step 1 &amp; 2</p>
            <h2 className="h2 mt-2">Staff quick-send. Customer taps. Review box opens.</h2>
            <ul className="mt-5 space-y-3 text-white/75">
              <li>✓ Counter-phone PWA, works on a cheap Android</li>
              <li>✓ Same Google review link for <b className="text-white">everyone</b> — no review gating, no incentives</li>
              <li>✓ Every message ends with “Reply STOP to stop messages”; opt-out honoured permanently</li>
              <li>✓ Tracked short link <code className="rounded bg-white/10 px-1.5">/r/aB3xK</code> logs the click, then forwards to Google</li>
            </ul>
          </div>
          <QuickSend />
        </div>
      </section>

      <section id="dash" className="section">
        <div className="wrap">
          <p className="eyebrow text-teal">Owner dashboard</p>
          <h2 className="h2 mb-6 mt-2">60 days later: 64 → 131 reviews.</h2>
          <Dashboard />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="eyebrow text-teal">AI reply assistant</p>
          <h2 className="h2 mb-6 mt-2">A calm, professional reply in seconds.</h2>
          <Inbox />
        </div>
      </section>

      <section className="section bg-gradient-to-b from-transparent via-[#1a1f45] to-transparent">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-teal">Wow feature</p>
            <h2 className="h2 mt-2">QR standee for every table.</h2>
            <p className="mt-4 max-w-md text-white/70">Generated from your brand kit as a print-ready PDF — for tables, counters and takeaway bags. Scanning opens the same Google review box.</p>
          </div>
          <Standee />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h2 mb-6 text-center">Simple pricing</h2>
          <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2" style={{ perspective: 1000 }}>
            {[
              ["Starter", "₹9,999", "₹3,499 / month", ["Quick-send page", "WhatsApp review messages", "Dashboard", "QR standee", "Hosting, monitoring & bug fixes included", "1 hour of changes per month"]],
              ["Pro", "₹12,999", "₹3,999 / month", ["Everything in Starter", "Auto triggers from billing / booking", "AI reply drafts", "Monthly review report", "Hosting, monitoring & bug fixes included", "2 hours of changes per month + priority support"]],
            ].map(([n, s, m, f]) => (
              <div key={n as string} className={`rb-card3d rounded-3xl border p-6 ${n === "Pro" ? "border-saffron bg-saffron/10" : "border-white/10 bg-white/5"}`}>
                <p className="text-sm font-bold uppercase tracking-widest text-white/60">{n as string}</p>
                <p className="mt-2 text-4xl font-black">{s as string}<span className="text-base font-semibold text-white/50"> setup</span></p>
                <p className="font-bold text-teal">+ {m as string}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-white/75">{(f as string[]).map((x) => <li key={x}>✓ {x}</li>)}</ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-white/50">WhatsApp charges passed through at actuals. Bundle with LocalRank as a “Google Growth” package.</p>
          <div className="mt-8 text-center">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-wa">Get this for my business on WhatsApp</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-sm text-white/50">
        <p className="font-bold text-saffron">Demo — fictional business</p>
        <p>ReviewBoost is a Neovia AI demo. Tandoor Tales is not a real company. Seeded data; no real messages are sent.</p>
      </footer>
    </div>
  );
}
