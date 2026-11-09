"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/** Agency-only: works out what ReviewBoost must charge to repay AI tools, infra, maintenance time and profit. */

const inr = (n: number) => `${n < 0 ? "-" : ""}₹${Math.abs(Math.round(n)).toLocaleString("en-IN")}`;
/** round up to a clean "x,999" style price */
const clean = (n: number) => Math.max(999, Math.ceil(n / 500) * 500 - 1);

type Tier = { name: string; setup: number; monthly: number; hrs: number };

function Num({ id, label, hint, value, set, step = 1, prefix }: { id: string; label: string; hint?: string; value: number; set: (n: number) => void; step?: number; prefix?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold">{label}</label>
      <div className="mt-1 flex items-center rounded-xl border border-slate-300 bg-white focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-700/30">
        {prefix && <span className="pl-3 text-slate-600">{prefix}</span>}
        <input id={id} type="number" min={0} step={step} inputMode="decimal" value={Number.isFinite(value) ? value : 0} onChange={(e) => set(Math.max(0, +e.target.value))} aria-describedby={hint ? `${id}-h` : undefined} className="w-full rounded-xl bg-transparent px-3 py-2.5 outline-none" />
      </div>
      {hint && <p id={`${id}-h`} className="mt-1 text-xs text-slate-600">{hint}</p>}
    </div>
  );
}

export default function PricingPlanner() {
  const [fx, setFx] = useState(88);
  const [claude, setClaude] = useState(100);
  const [codex, setCodex] = useState(20);
  const [share, setShare] = useState(40);
  const [vercel, setVercel] = useState(20);
  const [supa, setSupa] = useState(25);
  const [clients, setClients] = useState(5);
  const [rate, setRate] = useState(500);
  const [days, setDays] = useState(2);
  const [hpd, setHpd] = useState(6);
  const [margin, setMargin] = useState(30);
  const [msgs, setMsgs] = useState(600);
  const [metaRate, setMetaRate] = useState(0.86);
  const [bsp, setBsp] = useState(20);
  const [tiers, setTiers] = useState<Tier[]>([
    { name: "Starter", setup: 9999, monthly: 3499, hrs: 1 },
    { name: "Pro", setup: 12999, monthly: 3999, hrs: 2 },
  ]);

  const m = useMemo(() => {
    const ai = (claude + codex) * fx;
    const aiShared = (ai * share) / 100;
    const infra = (vercel + supa) * fx;
    const fixed = aiShared + infra;
    const perClientTools = fixed / Math.max(1, clients);
    const mg = Math.min(0.9, margin / 100);
    const buildAi = ai * (days / 22);
    const setupLabour = days * hpd * rate;
    const setupCost = setupLabour + buildAi;
    const wa = msgs * metaRate * (1 + bsp / 100);
    const rows = tiers.map((t) => {
      const maint = t.hrs * rate;
      const cost = perClientTools + maint;
      const monthlyMin = clean(cost / (1 - mg));
      const setupMin = clean(setupCost / (1 - mg));
      const profitM = t.monthly - cost;
      const breakEven = t.monthly > maint ? Math.ceil(fixed / (t.monthly - maint)) : null;
      return { ...t, maint, cost, monthlyMin, setupMin, profitM, profitS: t.setup - setupCost, breakEven, okM: t.monthly >= cost / (1 - mg), okS: t.setup >= setupCost / (1 - mg) };
    });
    return { ai, aiShared, infra, fixed, perClientTools, setupCost, setupLabour, buildAi, wa, rows };
  }, [fx, claude, codex, share, vercel, supa, clients, rate, days, hpd, margin, msgs, metaRate, bsp, tiers]);

  const setTier = (i: number, p: Partial<Tier>) => setTiers((t) => t.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const applyRec = () => setTiers((t) => t.map((x, i) => ({ ...x, setup: m.rows[i].setupMin, monthly: m.rows[i].monthlyMin })));

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <div className="bg-red-900 px-4 py-2 text-center text-xs font-bold text-white">🔒 Private: your cost &amp; profit planner. Do not show this page to clients. · <Link href="/reviewboost/dashboard" className="underline">Dashboard</Link> · <Link href="/reviewboost" className="underline">3D demo</Link></div>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <header>
          <h1 className="text-3xl font-black tracking-tight">ReviewBoost pricing planner</h1>
          <p className="mt-1 max-w-3xl text-slate-700">Change the numbers on the left. The planner shows the setup fee and monthly maintenance fee needed so that every client repays your <b>Claude + Codex</b> subscriptions, hosting, your maintenance time, and still leaves profit.</p>
          <p className="mt-2 max-w-3xl rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950">⚠ Tool prices, the dollar rate and your hourly value are <b>assumptions</b>, not checked live prices. Open each provider’s pricing page and correct them before quoting anyone.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()} aria-label="Cost inputs">
            <fieldset className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"><legend className="px-1 text-sm font-extrabold">Your tools (per month)</legend>
              <Num id="fx" label="USD → INR" value={fx} set={setFx} prefix="₹" />
              <Num id="claude" label="Claude plan" hint="e.g. Pro $20, Max $100 or $200" value={claude} set={setClaude} prefix="$" />
              <Num id="codex" label="Codex / ChatGPT plan" hint="e.g. Plus $20, Pro $200" value={codex} set={setCodex} prefix="$" />
              <Num id="share" label="Share of AI cost charged to ReviewBoost clients" hint="You also use these tools for other work, so charge only part of it." value={share} set={setShare} prefix="%" />
              <Num id="vercel" label="Vercel hosting" value={vercel} set={setVercel} prefix="$" />
              <Num id="supa" label="Supabase database" value={supa} set={setSupa} prefix="$" />
            </fieldset>
            <fieldset className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"><legend className="px-1 text-sm font-extrabold">Your time &amp; profit</legend>
              <Num id="clients" label="Paying clients sharing the tool costs" value={clients} set={setClients} />
              <Num id="rate" label="Your hourly value" hint="What an hour of your work should earn." value={rate} set={setRate} prefix="₹" />
              <Num id="days" label="Setup days per new client" hint="Branding, Place ID, WhatsApp template approval, staff training." value={days} set={setDays} step={0.5} />
              <Num id="hpd" label="Working hours per day" value={hpd} set={setHpd} />
              <Num id="margin" label="Target profit margin" hint="On top of costs and your hourly value." value={margin} set={setMargin} prefix="%" />
            </fieldset>
            <fieldset className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"><legend className="px-1 text-sm font-extrabold">WhatsApp (billed at actuals)</legend>
              <Num id="msgs" label="Messages per client per month" value={msgs} set={setMsgs} />
              <Num id="meta" label="Meta rate per message" hint="About ₹0.86 marketing rate in India (from your scope note)." value={metaRate} set={setMetaRate} step={0.01} prefix="₹" />
              <Num id="bsp" label="Provider (BSP) markup" value={bsp} set={setBsp} prefix="%" />
            </fieldset>
          </form>

          <div className="space-y-6" aria-live="polite">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-extrabold">Where the money goes</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Claude + Codex to repay", inr(m.aiShared), `${share}% of ${inr(m.ai)}/mo`],
                  ["Hosting to repay", inr(m.infra), "Vercel + Supabase /mo"],
                  ["Tool cost per client", inr(m.perClientTools), `split over ${clients} clients`],
                  ["WhatsApp per client", inr(m.wa), "pass-through, not in your fee"],
                ].map(([k, v, h]) => (
                  <div key={k} className="rounded-xl bg-slate-100 p-3"><dt className="text-xs font-bold text-slate-700">{k}</dt><dd className="text-2xl font-black">{v}</dd><dd className="text-xs text-slate-600">{h}</dd></div>
                ))}
              </dl>
              <p className="mt-3 text-sm text-slate-700">One new client costs you about <b>{inr(m.setupCost)}</b> to set up ({days} days of your time = {inr(m.setupLabour)} + {inr(m.buildAi)} of AI-tool usage).</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-extrabold">Your packages vs. what you need to charge</h2>
                <button type="button" onClick={applyRec} className="rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-ink-soft">Use recommended prices</button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {m.rows.map((r, i) => (
                  <article key={r.name} className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="text-xl font-black">{r.name}</h3>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <Num id={`s${i}`} label="Setup price" value={r.setup} set={(n) => setTier(i, { setup: n })} prefix="₹" step={500} />
                      <Num id={`m${i}`} label="Monthly price" value={r.monthly} set={(n) => setTier(i, { monthly: n })} prefix="₹" step={500} />
                    </div>
                    <div className="mt-3"><Num id={`h${i}`} label="Maintenance hours per month included" value={r.hrs} set={(n) => setTier(i, { hrs: n })} step={0.5} /></div>
                    <ul className="mt-4 space-y-2 text-sm">
                      <li className={`rounded-lg px-3 py-2 font-semibold ${r.okS ? "bg-emerald-100 text-emerald-950" : "bg-red-100 text-red-950"}`}>
                        <span aria-hidden="true">{r.okS ? "✓" : "⚠"}</span> Setup: {r.okS ? "covers costs + target profit" : `too low — charge at least ${inr(r.setupMin)}`}
                        <span className="block text-xs font-normal">Profit on setup: {inr(r.profitS)}</span>
                      </li>
                      <li className={`rounded-lg px-3 py-2 font-semibold ${r.okM ? "bg-emerald-100 text-emerald-950" : "bg-red-100 text-red-950"}`}>
                        <span aria-hidden="true">{r.okM ? "✓" : "⚠"}</span> Monthly: {r.okM ? "covers tools + maintenance + profit" : `too low — charge at least ${inr(r.monthlyMin)}`}
                        <span className="block text-xs font-normal">Costs {inr(r.cost)} (tools {inr(m.perClientTools)} + your time {inr(r.maint)}) · profit {inr(r.profitM)}/client/month</span>
                      </li>
                      <li className="rounded-lg bg-slate-100 px-3 py-2 text-xs">
                        {r.breakEven ? <>Break-even: you need <b>{r.breakEven}</b> client{r.breakEven > 1 ? "s" : ""} on this plan to repay all shared tool costs.</> : <>This monthly price does not even cover your maintenance time.</>}
                      </li>
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-extrabold">If you sign {clients} clients on each plan</h2>
              <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <caption className="sr-only">Monthly and yearly money by plan</caption>
                  <thead className="bg-slate-100"><tr>{["Plan", "Monthly income", "Tools & hosting repaid", "Your maintenance time paid", "Pure profit / month", "Pure profit / year"].map((h) => <th key={h} scope="col" className="px-3 py-2 font-extrabold">{h}</th>)}</tr></thead>
                  <tbody>
                    {m.rows.map((r) => {
                      const income = r.monthly * clients, tools = m.fixed, time = r.maint * clients, profit = income - tools - time;
                      return <tr key={r.name} className="border-t border-slate-100"><th scope="row" className="px-3 py-2">{r.name}</th><td className="px-3 py-2">{inr(income)}</td><td className="px-3 py-2">{inr(tools)}</td><td className="px-3 py-2">{inr(time)}</td><td className={`px-3 py-2 font-bold ${profit < 0 ? "text-red-800" : "text-emerald-800"}`}>{inr(profit)}</td><td className="px-3 py-2 font-bold">{inr(profit * 12)}</td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-600">Setup fees are extra one-time income. WhatsApp message charges are billed to the client at actuals, so they never eat into this.</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-extrabold">What to put in the client contract</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-800">
                <li><b>Monthly fee includes:</b> hosting, uptime monitoring, bug fixes, review-count tracking, and the maintenance hours you set above.</li>
                <li><b>Extra hours</b> beyond the included time at {inr(rate)}/hour (or a fixed add-on).</li>
                <li><b>WhatsApp message charges</b> billed at actuals with the provider markup shown on the monthly bill.</li>
                <li><b>Price review</b> every 12 months, or when Meta, Google or your tool prices change.</li>
                <li>Keep one month’s fee as notice for cancellation so a single churn does not leave tool costs uncovered.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
