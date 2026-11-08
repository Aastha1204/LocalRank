"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CONTACT, PAYMENTS, upiLink } from "@/config/site";

/* ---------------- types & seed data ---------------- */
type Status = "sent" | "delivered" | "read" | "clicked" | "stopped";
type Reminder = "pending" | "sent" | "not-needed" | "cancelled";
type Req = { id: number; name: string; phone: string; staff: string; status: Status; time: string; source: string; reminder: Reminder };
type View = "overview" | "send" | "reviews" | "staff" | "qr" | "settings" | "plans";

const PLANS = [
  { id: "Starter", setup: 9999, monthly: 3499, features: ["Quick-send page for the counter", "WhatsApp review messages + one reminder", "Owner dashboard & staff leaderboard", "QR standee for tables", "Hosting, monitoring & bug fixes", "1 hour of changes every month"] },
  { id: "Pro", setup: 12999, monthly: 3999, popular: true, features: ["Everything in Starter", "Auto-send from your billing or booking system", "AI reply drafts for Google reviews", "Monthly review report", "Hosting, monitoring & bug fixes", "2 hours of changes + priority support"] },
] as const;
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const NAV: { id: View; label: string; icon: string; what: string }[] = [
  { id: "overview", label: "Overview", icon: "📊", what: "Your results at a glance: requests, clicks and Google review growth." },
  { id: "send", label: "Send requests", icon: "📨", what: "Ask customers for a Google review on WhatsApp: one by one, from a file, or automatically." },
  { id: "reviews", label: "Reviews & replies", icon: "💬", what: "Read new Google reviews and get an AI-written reply you can edit and copy." },
  { id: "staff", label: "Staff leaderboard", icon: "🏅", what: "See which team member's customers tap the review link the most." },
  { id: "qr", label: "QR standee", icon: "🔳", what: "Print a table-tent so customers can scan and review without a message." },
  { id: "settings", label: "Settings", icon: "⚙️", what: "Business details, review link, message text, send delay and staff list." },
  { id: "plans", label: "Plans & booking", icon: "💳", what: "See the price, then book on WhatsApp and pay. No forms, no sign-up." },
];

const BASE = { sent: 420, delivered: 401, read: 318, clicked: 160 };
const BASE_STAFF: Record<string, { sent: number; clicked: number }> = {
  Sneha: { sent: 168, clicked: 77 },
  Rohit: { sent: 152, clicked: 56 },
  Imran: { sent: 100, clicked: 27 },
};

const SEED: Req[] = [
  { id: 1, name: "Priya Mehta", phone: "98200 11122", staff: "Sneha", status: "clicked", time: "10:42", source: "Quick send", reminder: "not-needed" },
  { id: 2, name: "Karan Shah", phone: "98334 55501", staff: "Rohit", status: "read", time: "10:15", source: "Quick send", reminder: "pending" },
  { id: 3, name: "Neha Desai", phone: "90040 22318", staff: "Imran", status: "delivered", time: "09:58", source: "Google Sheet", reminder: "pending" },
  { id: 4, name: "Vikram Rao", phone: "97022 88140", staff: "Sneha", status: "stopped", time: "09:30", source: "Quick send", reminder: "cancelled" },
];

const REVIEWS = [
  { id: 1, who: "Karan S.", stars: 1, when: "2 hours ago", text: "Waited 50 minutes for starters and the dal makhani was cold. Very disappointed for a Saturday night." },
  { id: 2, who: "Priya M.", stars: 5, when: "Yesterday", text: "Butter chicken and garlic naan were outstanding. Staff was warm and quick. Will come again with family!" },
  { id: 3, who: "Neha D.", stars: 4, when: "2 days ago", text: "Great taste, but parking is a pain and the AC was a bit weak." },
];

function growth() {
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out: number[] = [];
  let c = 64;
  for (let i = 0; i < 60; i++) {
    const t = 64 + (67 * (i + 1)) / 60;
    c = i === 59 ? 131 : Math.max(c, Math.round(t + (rnd() - 0.5) * 2.2));
    out.push(c);
  }
  return out;
}

const STATUS_UI: Record<Status, { label: string; icon: string; cls: string }> = {
  sent: { label: "Sent", icon: "✓", cls: "bg-slate-100 text-slate-800" },
  delivered: { label: "Delivered", icon: "✓✓", cls: "bg-sky-100 text-sky-900" },
  read: { label: "Read", icon: "👁", cls: "bg-teal-100 text-teal-900" },
  clicked: { label: "Clicked", icon: "👆", cls: "bg-amber-100 text-amber-900" },
  stopped: { label: "Opted out", icon: "⛔", cls: "bg-red-100 text-red-900" },
};
const REM_UI: Record<Reminder, string> = {
  pending: "Due in 48 hrs if not clicked",
  sent: "Reminder sent (final)",
  "not-needed": "Not needed — link clicked",
  cancelled: "Cancelled — opted out",
};

/* ---------------- small shared pieces ---------------- */
function Badge({ s }: { s: Status }) {
  const u = STATUS_UI[s];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${u.cls}`}><span aria-hidden="true">{u.icon}</span>{u.label}</span>;
}
function Card({ title, hint, children, className = "" }: { title?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title && <h2 className="text-lg font-extrabold text-ink">{title}</h2>}
      {hint && <p className="mb-3 mt-0.5 text-sm text-slate-600">{hint}</p>}
      {children}
    </section>
  );
}
const input = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-ink placeholder:text-slate-500 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30";
const btnP = "rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ink-soft focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const btnS = "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-ink transition hover:bg-slate-100 disabled:opacity-50";

const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
const digits = (p: string) => p.replace(/\D/g, "");

/* ---------------- main ---------------- */
export default function Dashboard() {
  const [view, setView] = useState<View>("overview");
  const [reqs, setReqs] = useState<Req[]>(SEED);
  const [staff, setStaff] = useState(["Sneha", "Rohit", "Imran"]);
  const [settings, setSettings] = useState({
    name: "Tandoor Tales Family Restaurant",
    placeId: "ChIJ-DEMO-PLACE-ID",
    delay: 2,
    template: "Hi {name} 👋 Thank you for dining with us at {business} today! Would you share a quick review? It takes 20 seconds ⭐",
  });
  const [msg, setMsg] = useState("");
  const [optedOut, setOptedOut] = useState<string[]>(["97022 88140"].map(digits));
  const heading = useRef<HTMLHeadingElement>(null);
  const timers = useRef<number[]>([]);
  const idRef = useRef(100);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { heading.current?.focus(); }, [view]);

  const reviewLink = `https://search.google.com/local/writereview?placeid=${settings.placeId || "PLACE_ID"}`;
  const announce = (m: string) => setMsg(m);

  const patch = (id: number, p: Partial<Req>) => setReqs((r) => r.map((x) => (x.id === id ? { ...x, ...p } : x)));

  /** one place that creates requests, so every entry point obeys opt-out + duplicates */
  const addRequests = (rows: { name: string; phone: string; staff: string }[], source: string) => {
    let added = 0, skippedOpt = 0, skippedBad = 0;
    const fresh: Req[] = [];
    for (const r of rows) {
      const d = digits(r.phone);
      if (r.name.trim().length < 2 || d.length < 10) { skippedBad++; continue; }
      if (optedOut.includes(d.slice(-10))) { skippedOpt++; continue; }
      const id = ++idRef.current;
      fresh.push({ id, name: r.name.trim(), phone: r.phone.trim(), staff: r.staff, status: "sent", time: nowTime(), source, reminder: "pending" });
      timers.current.push(
        window.setTimeout(() => setReqs((x) => x.map((q) => (q.id === id && q.status === "sent" ? { ...q, status: "delivered" } : q))), 900),
        window.setTimeout(() => setReqs((x) => x.map((q) => (q.id === id && q.status === "delivered" ? { ...q, status: "read" } : q))), 2200),
      );
      added++;
    }
    if (fresh.length) setReqs((x) => [...fresh.reverse(), ...x]);
    window.dispatchEvent(new Event("rb-send"));
    return { added, skippedOpt, skippedBad };
  };

  const click = (id: number) => setReqs((x) => x.map((q) => q.id === id && q.status !== "stopped" ? { ...q, status: "clicked", reminder: q.reminder === "pending" ? "not-needed" : q.reminder } : q));
  const stop = (id: number) => {
    const r = reqs.find((q) => q.id === id);
    if (!r) return;
    setOptedOut((o) => [...new Set([...o, digits(r.phone).slice(-10)])]);
    setReqs((x) => x.map((q) => (digits(q.phone).slice(-10) === digits(r.phone).slice(-10) ? { ...q, status: "stopped", reminder: "cancelled" } : q)));
    announce(`${r.name} replied STOP. Opted out permanently; no further messages will be sent.`);
  };
  const skip48 = () => {
    const due = reqs.filter((q) => q.reminder === "pending" && q.status !== "clicked" && q.status !== "stopped").length;
    setReqs((x) => x.map((q) => (q.reminder === "pending" && q.status !== "clicked" && q.status !== "stopped" ? { ...q, reminder: "sent" } : q)));
    announce(due ? `48 hours passed. ${due} reminder${due > 1 ? "s" : ""} sent — one each, and never again.` : "48 hours passed. No reminders were due.");
  };

  /* live-derived numbers on top of the 60-day seeded history */
  const stats = useMemo(() => {
    const live = reqs.filter((r) => r.id > 100);
    const sent = BASE.sent + live.length;
    const delivered = BASE.delivered + live.filter((r) => r.status !== "sent" && r.status !== "stopped").length;
    const read = BASE.read + live.filter((r) => r.status === "read" || r.status === "clicked").length;
    const clicked = BASE.clicked + live.filter((r) => r.status === "clicked").length;
    return { sent, delivered, read, clicked, ctr: Math.round((clicked / sent) * 100) };
  }, [reqs]);

  const cur = NAV.find((n) => n.id === view)!;

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <a href="#rb-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white">Skip to main content</a>
      <div className="print:hidden bg-ink px-4 py-2 text-center text-xs font-semibold text-white">
        ReviewBoost dashboard prototype · Tandoor Tales (fictional) · no real messages are sent · <Link href="/reviewboost" className="underline">← Back to 3D demo</Link>
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[250px_1fr]">
        <nav aria-label="Dashboard sections" className="print:hidden min-w-0 lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 hidden px-2 text-xs font-extrabold uppercase tracking-widest text-slate-600 lg:block">Menu</p>
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {NAV.map((n) => (
              <li key={n.id} className="shrink-0">
                <button type="button" onClick={() => setView(n.id)} aria-current={view === n.id ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${view === n.id ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-slate-200 hover:bg-slate-100"}`}>
                  <span aria-hidden="true" className="text-lg">{n.icon}</span>{n.label}
                  {n.id === "reviews" && <span className="ml-auto rounded-full bg-red-600 px-2 text-xs text-white" aria-label="1 new low-rated review">1</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main id="rb-main" className="min-w-0">
          <header className="print:hidden mb-5">
            <h1 ref={heading} tabIndex={-1} className="text-3xl font-black tracking-tight outline-none">{cur.label}</h1>
            <p className="mt-1 max-w-2xl text-slate-700"><span className="font-bold">What this does: </span>{cur.what}</p>
          </header>
          <div role="status" aria-live="polite" className={`print:hidden mb-4 rounded-xl border border-teal-700/30 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-950 ${msg ? "" : "sr-only"}`}>
            {msg}
            {msg && <button type="button" onClick={() => setMsg("")} className="ml-3 underline">Dismiss</button>}
          </div>

          {view === "overview" && <Overview stats={stats} go={setView} />}
          {view === "send" && (
            <Send staff={staff} reqs={reqs} addRequests={addRequests} setMsg={announce} click={click} stop={stop} skip48={skip48} delay={settings.delay} />
          )}
          {view === "reviews" && <Reviews biz={settings.name} setMsg={announce} />}
          {view === "staff" && <Staff reqs={reqs} staff={staff} />}
          {view === "qr" && <Qr name={settings.name} link={reviewLink} />}
          {view === "settings" && <Settings s={settings} setS={setSettings} staff={staff} setStaff={setStaff} link={reviewLink} setMsg={announce} />}
          {view === "plans" && <Plans setMsg={announce} />}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Overview ---------------- */
function Overview({ stats, go }: { stats: { sent: number; delivered: number; read: number; clicked: number; ctr: number }; go: (v: View) => void }) {
  const days = useMemo(growth, []);
  const [table, setTable] = useState(false);
  const W = 640, H = 220, P = 30, mn = 60, mx = 135;
  const pts = days.map((v, i) => [P + (i / 59) * (W - P * 2), H - P - ((v - mn) / (mx - mn)) * (H - P * 2)] as const);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const kpis: [string, string, string][] = [
    ["Requests sent", String(stats.sent), "Review messages sent in 60 days"],
    ["Click-through rate", `${stats.ctr}%`, `${stats.clicked} people tapped the review link`],
    ["Google rating", "4.7 ★", "Up from 4.4 at go-live"],
    ["Google reviews", "131", "Up from 64 (+67)"],
  ];
  const funnel: [string, number][] = [["Sent", stats.sent], ["Delivered", stats.delivered], ["Read", stats.read], ["Clicked", stats.clicked]];
  return (
    <div className="space-y-5">
      <Card className="border-red-300 bg-red-50">
        <h2 className="text-lg font-extrabold text-red-950">🔔 1 new low-rated review needs attention</h2>
        <p className="mt-1 text-sm text-red-950">Karan S. left 1★ two hours ago. An alert was sent to the owner on WhatsApp.</p>
        <button type="button" className={`${btnP} mt-3`} onClick={() => go("reviews")}>Open the review and AI reply →</button>
      </Card>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map(([l, v, h]) => (
          <li key={l} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-700">{l}</p>
            <p className="text-3xl font-black">{v}</p>
            <p className="text-xs text-slate-600">{h}</p>
          </li>
        ))}
      </ul>
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3" title="Google review count, last 60 days" hint="Read from Google Places every morning.">
          {!table ? (
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Line chart: Google review count grew steadily from 64 to 131 over 60 days.">
              {[70, 100, 130].map((g) => { const y = H - P - ((g - mn) / (mx - mn)) * (H - P * 2); return <g key={g}><line x1={P} x2={W - P} y1={y} y2={y} stroke="#cbd5e1" /><text x={2} y={y + 4} fontSize="12" fill="#475569">{g}</text></g>; })}
              <path d={line} fill="none" stroke="#0f6f66" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={pts[59][0]} cy={pts[59][1]} r="5" fill="#b86f0a" />
              <text x={W - P} y={pts[59][1] - 12} fontSize="14" fontWeight="800" fill="#7a4a06" textAnchor="end">131</text>
              <text x={P} y={H - 6} fontSize="12" fill="#475569">Day 1</text>
              <text x={W - P} y={H - 6} fontSize="12" fill="#475569" textAnchor="end">Day 60</text>
            </svg>
          ) : (
            <div className="max-h-56 overflow-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm"><caption className="sr-only">Review count by day</caption>
                <thead className="sticky top-0 bg-slate-100 text-left"><tr><th scope="col" className="px-3 py-2">Day</th><th scope="col" className="px-3 py-2">Reviews</th></tr></thead>
                <tbody>{days.map((v, i) => (i % 5 === 0 || i === 59) && <tr key={i} className="border-t border-slate-100"><td className="px-3 py-1.5">Day {i + 1}</td><td className="px-3 py-1.5">{v}</td></tr>)}</tbody>
              </table>
            </div>
          )}
          <button type="button" className={`${btnS} mt-3`} aria-pressed={table} onClick={() => setTable((t) => !t)}>{table ? "Show chart" : "Show as table"}</button>
        </Card>
        <Card className="lg:col-span-2" title="Message funnel" hint="How far each request gets. Updates live when you send from the next page.">
          <ol className="space-y-3">
            {funnel.map(([l, v]) => (
              <li key={l}>
                <div className="flex justify-between text-sm"><span className="font-semibold">{l}</span><span className="font-black">{v}</span></div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-200" role="presentation"><div className="h-full rounded-full bg-teal-700 transition-all duration-700" style={{ width: `${(v / funnel[0][1]) * 100}%` }} /></div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
      <Card title="Not sure what to do first?">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-800">
          <li>Go to <b>Send requests</b> and send to a customer who just paid.</li>
          <li>Come back here weekly to check clicks and review growth.</li>
          <li>Open <b>Reviews &amp; replies</b> when the red alert appears.</li>
        </ol>
      </Card>
    </div>
  );
}

/* ---------------- Send requests ---------------- */
function Send({ staff, reqs, addRequests, setMsg, click, stop, skip48, delay }: {
  staff: string[]; reqs: Req[]; addRequests: (r: { name: string; phone: string; staff: string }[], s: string) => { added: number; skippedOpt: number; skippedBad: number };
  setMsg: (m: string) => void; click: (id: number) => void; stop: (id: number) => void; skip48: () => void; delay: number;
}) {
  const [tab, setTab] = useState<"quick" | "file" | "auto">("quick");
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [who, setWho] = useState(staff[0] ?? "");
  const [consent, setConsent] = useState(false);
  const [csv, setCsv] = useState("Aarav Shah, 98200 12345, Rohit\nMeera Iyer, 99877 66554, Sneha\nTest Bad, 123, Imran");
  const [trig, setTrig] = useState<Record<string, boolean>>({ "Google Sheet row added": true, "Booking system webhook (ShowUp)": false, "Billing system webhook (SlotPay)": false });
  const t0 = useRef<number | null>(null);
  const tabs = [["quick", "Quick send"], ["file", "Upload list"], ["auto", "Automatic"]] as const;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const secs = ((performance.now() - (t0.current ?? performance.now())) / 1000).toFixed(1);
    const r = addRequests([{ name, phone, staff: who }], "Quick send");
    if (r.skippedOpt) setMsg(`Not sent: ${name} has opted out (replied STOP). Opt-outs are permanent.`);
    else if (r.skippedBad) setMsg("Not sent: check the name and 10-digit number.");
    else { setMsg(`Sent to ${name} in ${secs} seconds. They will get the message ${delay} hour${delay > 1 ? "s" : ""} after the visit in the live product.`); setName(""); setPhone(""); setConsent(false); t0.current = null; }
  };
  const upload = () => {
    const rows = csv.split("\n").map((l) => l.split(",").map((s) => s.trim())).filter((c) => c.length >= 2 && c[0]).map((c) => ({ name: c[0], phone: c[1], staff: c[2] || staff[0] }));
    const r = addRequests(rows, "List upload");
    setMsg(`${r.added} sent. ${r.skippedBad} skipped (invalid number). ${r.skippedOpt} skipped (opted out).`);
  };
  const simulate = (src: string, n: string, p: string) => { const r = addRequests([{ name: n, phone: p, staff: staff[0] }], src); setMsg(r.added ? `${src}: new request created automatically for ${n}.` : `${src}: skipped.`); };

  return (
    <div className="space-y-5">
      <Card>
        <div role="tablist" aria-label="Ways to send" className="mb-4 flex flex-wrap gap-2">
          {tabs.map(([id, l]) => (
            <button key={id} role="tab" type="button" id={`tab-${id}`} aria-selected={tab === id} aria-controls={`panel-${id}`} onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${tab === id ? "bg-ink text-white" : "bg-slate-100 text-ink hover:bg-slate-200"}`}>{l}</button>
          ))}
        </div>

        {tab === "quick" && (
          <form id="panel-quick" role="tabpanel" aria-labelledby="tab-quick" onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <p className="text-sm text-slate-700 md:col-span-2">Best for the counter: staff type a name and number, pick who served, and tap Send. Takes under 5 seconds.</p>
            <div><label htmlFor="q-name" className="text-sm font-bold">Customer name</label><input id="q-name" required autoComplete="off" className={input} value={name} onFocus={() => (t0.current ??= performance.now())} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aarav Shah" /></div>
            <div><label htmlFor="q-phone" className="text-sm font-bold">WhatsApp number</label><input id="q-phone" required inputMode="tel" autoComplete="off" className={input} value={phone} onFocus={() => (t0.current ??= performance.now())} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" aria-describedby="q-phone-h" /><p id="q-phone-h" className="mt-1 text-xs text-slate-600">Try 97022 88140 to see an opted-out customer get blocked.</p></div>
            <fieldset className="md:col-span-2"><legend className="text-sm font-bold">Served by</legend>
              <div className="mt-1 flex flex-wrap gap-2">{staff.map((s) => <label key={s} className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-bold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-700 ${who === s ? "border-teal-700 bg-teal-50 text-teal-950" : "border-slate-300"}`}><input type="radio" name="who" className="sr-only" checked={who === s} onChange={() => setWho(s)} />{s}</label>)}</div>
            </fieldset>
            <label className="flex items-start gap-2 text-sm md:col-span-2"><input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4" /><span>Customer was told at the counter: “We’ll send your bill and a feedback link on WhatsApp.” <span className="text-slate-600">(consent is recorded)</span></span></label>
            <div className="md:col-span-2"><button type="submit" className={btnP}>Send review request →</button></div>
          </form>
        )}

        {tab === "file" && (
          <div id="panel-file" role="tabpanel" aria-labelledby="tab-file" className="space-y-3">
            <p className="text-sm text-slate-700">Paste a list or upload a CSV exported from your billing software. One customer per line: <code className="rounded bg-slate-100 px-1">name, phone, staff</code>. Invalid and opted-out numbers are skipped automatically.</p>
            <label htmlFor="csv" className="text-sm font-bold">Customer list</label>
            <textarea id="csv" rows={5} className={`${input} font-mono text-sm`} value={csv} onChange={(e) => setCsv(e.target.value)} />
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={btnP} onClick={upload}>Send to this list</button>
              <label className={`${btnS} cursor-pointer`}>Choose CSV file<input type="file" accept=".csv,text/csv" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setCsv(await f.text()); }} /></label>
            </div>
          </div>
        )}

        {tab === "auto" && (
          <div id="panel-auto" role="tabpanel" aria-labelledby="tab-auto" className="space-y-3">
            <p className="text-sm text-slate-700">No typing needed: a request is created whenever one of these happens. Switch a trigger on, then press “Simulate event” to see it work.</p>
            <ul className="space-y-2">
              {Object.keys(trig).map((k) => (
                <li key={k} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <label className="flex flex-1 items-center gap-3 text-sm font-bold"><input type="checkbox" role="switch" checked={trig[k]} onChange={(e) => setTrig({ ...trig, [k]: e.target.checked })} className="h-5 w-5" />{k}</label>
                  <button type="button" className={btnS} disabled={!trig[k]} onClick={() => simulate(k.split(" (")[0], "Rhea Kapoor", "98765 43210")}>Simulate event</button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-600">Messages go out {delay} hour{delay > 1 ? "s" : ""} after the visit (change in Settings).</p>
          </div>
        )}
      </Card>

      <Card title="Requests" hint="Every request, newest first. Use the buttons to simulate what customers do.">
        <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" className={btnS} onClick={skip48}>⏩ Jump ahead 48 hours (demo)</button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Review requests with status, reminder state and demo actions</caption>
            <thead className="bg-slate-100"><tr>{["Customer", "Staff", "Source", "Status", "Reminder", "Demo actions"].map((h) => <th key={h} scope="col" className="px-3 py-2 font-extrabold">{h}</th>)}</tr></thead>
            <tbody>
              {reqs.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <th scope="row" className="px-3 py-2 font-bold">{r.name}<span className="block text-xs font-normal text-slate-600">{r.phone} · {r.time}</span></th>
                  <td className="px-3 py-2">{r.staff}</td>
                  <td className="px-3 py-2">{r.source}</td>
                  <td className="px-3 py-2"><Badge s={r.status} /></td>
                  <td className="px-3 py-2 text-xs">{REM_UI[r.reminder]}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1.5">
                      <button type="button" className={btnS} disabled={r.status === "clicked" || r.status === "stopped"} onClick={() => click(r.id)} aria-label={`Simulate ${r.name} tapping the review link`}>Tap link</button>
                      <button type="button" className={btnS} disabled={r.status === "stopped"} onClick={() => stop(r.id)} aria-label={`Simulate ${r.name} replying STOP`}>Reply STOP</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-700">
          <li>Exactly one reminder, and only if the link was not tapped. Then it stops.</li>
          <li>Everyone gets the same review link, whatever they felt about the visit. No filtering, no rewards.</li>
        </ul>
      </Card>
    </div>
  );
}

/* ---------------- Reviews & AI replies ---------------- */
function Reviews({ biz, setMsg }: { biz: string; setMsg: (m: string) => void }) {
  const [sel, setSel] = useState(1);
  const [tone, setTone] = useState<"English" | "Hinglish">("English");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [posted, setPosted] = useState<number[]>([]);
  const [filter, setFilter] = useState<"all" | "low">("all");
  const r = REVIEWS.find((x) => x.id === sel)!;
  const key = `${sel}-${tone}`;
  const first = r.who.split(" ")[0];
  const auto = r.stars >= 4
    ? tone === "English"
      ? `Hi ${first}, thank you so much for the lovely words! We're thrilled you enjoyed it. ${r.stars === 4 ? "We'll look into the parking and AC points you raised. " : ""}Hope to welcome you again soon. – Team ${biz.split(" ").slice(0, 2).join(" ")}`
      : `Hi ${first}, bahut shukriya! Khushi hui ki aapko pasand aaya. ${r.stars === 4 ? "Parking aur AC wali baat par hum kaam karenge. " : ""}Jaldi milte hain! – Team ${biz.split(" ").slice(0, 2).join(" ")}`
    : tone === "English"
      ? `Hi ${first}, we're truly sorry about the long wait and the cold dal makhani. That's not the standard we hold ourselves to. Please call our manager so we can make this right. – Team ${biz.split(" ").slice(0, 2).join(" ")}`
      : `Hi ${first}, wait time aur thanda dal makhani ke liye hum dil se maafi chahte hain. Yeh hamare standard ka nahi hai. Kripya manager ko call karein, hum theek karenge. – Team ${biz.split(" ").slice(0, 2).join(" ")}`;
  const text = drafts[key] ?? auto;
  const list = REVIEWS.filter((x) => filter === "all" || x.stars <= 2);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Latest Google reviews" hint="Google lets us read the 5 newest. Full history needs Google Business Profile approval.">
        <div role="group" aria-label="Filter reviews" className="mb-3 flex gap-2">
          {([["all", "All"], ["low", "Needs attention (1–2★)"]] as const).map(([k, l]) => <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={`rounded-full px-3 py-1.5 text-sm font-bold ${filter === k ? "bg-ink text-white" : "bg-slate-100 hover:bg-slate-200"}`}>{l}</button>)}
        </div>
        <ul className="space-y-2">
          {list.map((x) => (
            <li key={x.id}>
              <button type="button" onClick={() => setSel(x.id)} aria-pressed={sel === x.id} className={`w-full rounded-xl border p-3 text-left transition ${sel === x.id ? "border-teal-700 bg-teal-50" : "border-slate-200 hover:bg-slate-50"}`}>
                <span className="flex items-center justify-between"><b>{x.who}</b><span><span aria-hidden="true" className="text-amber-600">{"★".repeat(x.stars)}</span><span className="sr-only">{x.stars} out of 5 stars</span> <span className="text-xs text-slate-600">· {x.when}</span></span></span>
                <span className="mt-1 block text-sm text-slate-800">{x.text}</span>
                {posted.includes(x.id) && <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900">✓ Reply posted</span>}
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="AI reply draft" hint="Review and edit before posting. The draft thanks the reviewer, mentions specifics and never argues.">
        <div role="group" aria-label="Reply language" className="mb-3 flex gap-2">
          {(["English", "Hinglish"] as const).map((t) => <button key={t} type="button" aria-pressed={tone === t} onClick={() => setTone(t)} className={`rounded-full px-3 py-1.5 text-sm font-bold ${tone === t ? "bg-ink text-white" : "bg-slate-100 hover:bg-slate-200"}`}>{t}</button>)}
        </div>
        <label htmlFor="draft" className="text-sm font-bold">Reply to {r.who} <span className="font-normal text-slate-600">(editable)</span></label>
        <textarea id="draft" rows={7} className={input} value={text} onChange={(e) => setDrafts({ ...drafts, [key]: e.target.value })} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={btnP} onClick={() => { navigator.clipboard?.writeText(text).catch(() => {}); setMsg("Reply copied. Paste it into your Google Business Profile."); }}>Copy reply</button>
          <button type="button" className={btnS} onClick={() => { setPosted([...posted, sel]); setMsg(`Marked as posted for ${r.who}.`); }} disabled={posted.includes(sel)}>Mark as posted</button>
          <button type="button" className={btnS} onClick={() => { const d = { ...drafts }; delete d[key]; setDrafts(d); }}>Reset draft</button>
        </div>
        <p className="mt-3 text-xs text-slate-600">Auto-posting to Google is available once Google Business Profile API access is approved.</p>
      </Card>
    </div>
  );
}

/* ---------------- Staff ---------------- */
function Staff({ reqs, staff }: { reqs: Req[]; staff: string[] }) {
  const rows = staff.map((n) => {
    const b = BASE_STAFF[n] ?? { sent: 0, clicked: 0 };
    const live = reqs.filter((r) => r.id > 100 && r.staff === n);
    const sent = b.sent + live.length, clicked = b.clicked + live.filter((r) => r.status === "clicked").length;
    return { n, sent, clicked, rate: sent ? Math.round((clicked / sent) * 100) : 0 };
  }).sort((a, b) => b.rate - a.rate);
  return (
    <Card title="Who gets customers to review?" hint="Click rate = customers who tapped the link ÷ requests sent. It updates when you send new requests.">
      <ol className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.n} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-extrabold"><span aria-hidden="true">{["🥇", "🥈", "🥉"][i] ?? "•"}</span> #{i + 1} {r.n}</p><p className="text-sm"><b>{r.sent}</b> sent · <b>{r.clicked}</b> clicked · <b>{r.rate}%</b> click rate</p></div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-teal-700 transition-all duration-700" style={{ width: `${Math.min(100, r.rate * 2)}%` }} /></div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-slate-700">💡 Tip: ask the top performer how they explain the feedback link at the counter, and share it with the team.</p>
    </Card>
  );
}

/* ---------------- QR ---------------- */
function Qr({ name, link }: { name: string; link: string }) {
  const cells = useMemo(() => {
    let s = 11; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const n = 21; const out: boolean[] = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const f = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      if (f) { const fx = x % 14 > 6 ? x - 14 : x, fy = y > 13 ? y - 14 : y; out.push(fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5)); } else out.push(rnd() > 0.52);
    }
    return out;
  }, []);
  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <Card title="Print and place" hint="Put it on tables, the billing counter and takeaway bags. Scanning opens the same Google review box.">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Press <b>Print / Save as PDF</b>.</li>
          <li>Choose A5 or A4, colour on.</li>
          <li>Fold it as a table tent.</li>
        </ol>
        <button type="button" className={`${btnP} mt-4`} onClick={() => window.print()}>Print / Save as PDF</button>
        <p className="mt-3 break-all text-xs text-slate-600">QR target: {link}</p>
        <p className="mt-1 text-xs text-slate-600">Prototype note: this QR is a decorative pattern. The live product generates a real scannable code.</p>
      </Card>
      <div className="receipt-print mx-auto w-72 rounded-3xl bg-gradient-to-b from-saffron to-[#d9811c] p-6 text-center shadow-xl">
        <p className="text-xs font-black uppercase tracking-widest text-ink/80">{name}</p>
        <p className="mt-1 text-2xl font-black leading-tight text-ink">Loved your meal?<br />Scan to review ⭐</p>
        <div role="img" aria-label="QR code placeholder" className="mx-auto mt-4 rounded-2xl bg-white p-3"><div className="grid aspect-square grid-cols-[repeat(21,1fr)]">{cells.map((c, i) => <span key={i} className={c ? "bg-ink" : "bg-white"} />)}</div></div>
        <p className="mt-3 text-xs font-bold text-ink/80">Opens the Google review box directly</p>
      </div>
    </div>
  );
}

/* ---------------- Plans & booking ---------------- */
function Plans({ setMsg }: { setMsg: (m: string) => void }) {
  const [plan, setPlan] = useState<(typeof PLANS)[number]["id"]>("Pro");
  const [biz, setBiz] = useState("");
  const p = PLANS.find((x) => x.id === plan)!;
  const half = Math.round(p.setup / 2);
  const wa = (text: string) => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
  const book = wa(`Hi Neovia AI, I'd like to book ReviewBoost ${p.id}.\nBusiness: ${biz.trim() || "(will share on chat)"}\nPrice: ${inr(p.setup)} setup + ${inr(p.monthly)}/month (WhatsApp message charges at actuals).\nPlease share the next steps.`);
  const paid = wa(`Hi Neovia AI, I have paid ${inr(half)} (50% setup) for ReviewBoost ${p.id}.\nBusiness: ${biz.trim() || "-"}\nPlease confirm.`);
  const ask = wa("Hi Neovia AI, I have a question about ReviewBoost.");
  const steps: [string, string][] = [
    ["Pick a plan", "Choose below and tap Book on WhatsApp. Your message is already written."],
    ["Chat & agree", "We confirm your Google Place ID, staff names and message text, and agree the scope in writing."],
    ["Pay 50% to start", `Pay ${inr(half)} by UPI only after the scope is agreed. The other 50% is due on delivery.`],
    ["Go live in 5–6 working days", "We set up WhatsApp, the dashboard and the QR standee, and train your staff."],
  ];
  return (
    <div className="space-y-5">
      <Card title="How booking works">
        <ol className="grid gap-3 md:grid-cols-4">
          {steps.map(([t, d], i) => (
            <li key={t} className="rounded-xl bg-slate-100 p-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-sm font-black text-white" aria-hidden="true">{i + 1}</span><p className="mt-2 font-extrabold">{t}</p><p className="text-sm text-slate-700">{d}</p></li>
          ))}
        </ol>
      </Card>

      <fieldset>
        <legend className="mb-2 text-lg font-extrabold">1. Choose your plan</legend>
        <div className="grid gap-4 md:grid-cols-2">
          {PLANS.map((x) => (
            <label key={x.id} className={`relative cursor-pointer rounded-2xl border-2 bg-white p-5 shadow-sm transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-teal-700/40 ${plan === x.id ? "border-teal-700" : "border-slate-200 hover:border-slate-400"}`}>
              <input type="radio" name="plan" className="sr-only" checked={plan === x.id} onChange={() => setPlan(x.id)} />
              {"popular" in x && <span className="absolute right-4 top-4 rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-extrabold text-amber-950">Most chosen</span>}
              <span className="flex items-center gap-2 text-xl font-black">{x.id}{plan === x.id && <span className="text-sm font-bold text-teal-800">✓ Selected</span>}</span>
              <span className="mt-2 block text-3xl font-black">{inr(x.setup)}<span className="text-base font-semibold text-slate-600"> setup</span></span>
              <span className="block font-bold text-teal-800">+ {inr(x.monthly)} / month</span>
              <ul className="mt-3 space-y-1 text-sm text-slate-800">{x.features.map((f) => <li key={f}><span aria-hidden="true">✓ </span>{f}</li>)}</ul>
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-700">WhatsApp message charges (about ₹0.86 per message from Meta, a little more through a provider) are billed at actuals and shown on your monthly bill.</p>
      </fieldset>

      <Card title="2. Book on WhatsApp" hint="Tap the button and WhatsApp opens with your plan and price already typed. Nothing is charged by tapping it.">
        <label htmlFor="biz" className="text-sm font-bold">Your business name <span className="font-normal text-slate-600">(optional, added to the message)</span></label>
        <input id="biz" className={input} value={biz} onChange={(e) => setBiz(e.target.value)} placeholder="e.g. Spice Route Restaurant" autoComplete="organization" />
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={book} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#15803d] px-5 py-3 font-black text-white hover:bg-[#116a34]">💬 Book {p.id} on WhatsApp<span className="sr-only"> (opens WhatsApp in a new tab)</span></a>
          <a href={ask} target="_blank" rel="noopener noreferrer" className={`${btnS} py-3`}>Ask a question first<span className="sr-only"> (opens WhatsApp in a new tab)</span></a>
        </div>
      </Card>

      <Card title="3. Pay (after we agree the scope)" hint={PAYMENTS.note}>
        <p className="text-sm text-slate-800">Amount to start: <b className="text-xl">{inr(half)}</b> <span className="text-slate-600">(50% of the {inr(p.setup)} setup)</span></p>
        <div className="mt-3 flex flex-wrap gap-3">
          <a href={upiLink(half)} className={btnP + " inline-block"}>Pay {inr(half)} by UPI</a>
          <button type="button" className={btnS} onClick={() => { navigator.clipboard?.writeText(PAYMENTS.upiId).catch(() => {}); setMsg(`UPI ID ${PAYMENTS.upiId} copied. Pay ${inr(half)} from any UPI app.`); }}>Copy UPI ID</button>
          <a href={paid} target="_blank" rel="noopener noreferrer" className={btnS + " inline-block"}>I have paid — tell Neovia on WhatsApp</a>
        </div>
        <p className="mt-3 text-xs text-slate-600">On a phone the UPI button opens your UPI app with the amount filled in. On a computer, copy the UPI ID and pay from your phone. Payment goes straight to the Neovia AI account and is confirmed on WhatsApp.</p>
      </Card>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function Settings({ s, setS, staff, setStaff, link, setMsg }: {
  s: { name: string; placeId: string; delay: number; template: string }; setS: (v: { name: string; placeId: string; delay: number; template: string }) => void;
  staff: string[]; setStaff: (v: string[]) => void; link: string; setMsg: (m: string) => void;
}) {
  const [add, setAdd] = useState("");
  const preview = s.template.replace("{name}", "Aarav").replace("{business}", s.name);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <Card title="Business" hint="Used in messages and in the review link.">
          <label htmlFor="s-name" className="text-sm font-bold">Business name</label>
          <input id="s-name" className={input} value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} />
          <label htmlFor="s-pid" className="mt-3 block text-sm font-bold">Google Place ID</label>
          <input id="s-pid" className={input} value={s.placeId} onChange={(e) => setS({ ...s, placeId: e.target.value.trim() })} aria-describedby="pid-h" />
          <p id="pid-h" className="mt-1 break-all text-xs text-slate-600">Review link: {link}</p>
        </Card>
        <Card title="When to send" hint="How long after the visit the message goes out.">
          <label htmlFor="s-delay" className="text-sm font-bold">Delay: {s.delay} hour{s.delay > 1 ? "s" : ""}</label>
          <input id="s-delay" type="range" min={1} max={3} step={1} value={s.delay} onChange={(e) => setS({ ...s, delay: +e.target.value })} className="mt-2 w-full accent-teal-700" aria-valuetext={`${s.delay} hours after the visit`} />
          <div className="flex justify-between text-xs text-slate-600" aria-hidden="true"><span>1 hr</span><span>2 hrs</span><span>3 hrs</span></div>
        </Card>
        <Card title="Staff list" hint="People who appear in the Served by picker.">
          <ul className="mb-3 flex flex-wrap gap-2">{staff.map((n) => <li key={n} className="flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-3 pr-1 text-sm font-bold">{n}<button type="button" className="rounded-full px-2 py-0.5 hover:bg-slate-300" aria-label={`Remove ${n}`} onClick={() => staff.length > 1 && setStaff(staff.filter((x) => x !== n))}>✕</button></li>)}</ul>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (add.trim() && !staff.includes(add.trim())) { setStaff([...staff, add.trim()]); setMsg(`${add.trim()} added to staff.`); setAdd(""); } }}>
            <label htmlFor="s-add" className="sr-only">New staff name</label>
            <input id="s-add" className={`${input} mt-0`} value={add} onChange={(e) => setAdd(e.target.value)} placeholder="New staff name" />
            <button type="submit" className={btnP}>Add</button>
          </form>
        </Card>
      </div>
      <Card title="Message template" hint="Use {name} and {business}. The opt-out line is added automatically and cannot be removed.">
        <label htmlFor="s-tpl" className="text-sm font-bold">Message text</label>
        <textarea id="s-tpl" rows={4} className={input} value={s.template} onChange={(e) => setS({ ...s, template: e.target.value })} />
        <p className="mt-4 text-sm font-bold">Live preview (what the customer sees)</p>
        <div className="mt-2 rounded-2xl bg-[#0b141a] p-4">
          <div className="max-w-[90%] rounded-xl rounded-tl-none bg-[#005c4b] p-3 text-sm text-[#e9edef]">
            {preview}
            <p className="mt-2 text-xs text-[#aebac1]">Reply STOP to stop messages</p>
            <p className="mt-2 rounded-lg bg-[#103529] py-2 text-center font-bold text-[#7fd0f5]">↗ Leave a Google review</p>
          </div>
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-slate-700">
          <li>Marketing-rate WhatsApp charge (about ₹0.86/message from Meta, more via a provider). Passed through at actuals.</li>
          <li>Do not offer discounts or freebies for reviews. Google prohibits it.</li>
        </ul>
      </Card>
    </div>
  );
}
