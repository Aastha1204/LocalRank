"use client";
import { useState } from "react";
import { ROI_DEFAULTS, waLink } from "@/config/site";
import { WhatsAppIcon } from "./Icons";

const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const num = (s: string) => Math.max(0, Number(s) || 0);

export default function RoiEstimator() {
  const [enq, setEnq] = useState(String(ROI_DEFAULTS.enquiries));
  const [pct, setPct] = useState(String(ROI_DEFAULTS.missedPct));
  const [val, setVal] = useState(String(ROI_DEFAULTS.value));

  const e = num(enq), p = Math.min(100, num(pct)), v = num(val);
  const result = e * (p / 100) * v;

  const field = "mt-1 w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-lg font-semibold";

  return (
    <div className="card mt-8 grid gap-8 p-6 md:grid-cols-2 md:p-8">
      <div className="space-y-5">
        <label className="block text-sm font-bold">
          Enquiries you get per month
          <input inputMode="numeric" className={field} value={enq} onChange={(x) => setEnq(x.target.value)} />
        </label>
        <label className="block text-sm font-bold">
          % currently missed or answered late
          <input inputMode="numeric" className={field} value={pct} onChange={(x) => setPct(x.target.value)} />
        </label>
        <label className="block text-sm font-bold">
          Average value of one customer (₹)
          <input inputMode="numeric" className={field} value={val} onChange={(x) => setVal(x.target.value)} />
        </label>
      </div>
      <div className="flex flex-col justify-between rounded-2xl bg-ink p-6 text-white">
        <div>
          <p className="text-sm font-semibold text-white/80">Potential value of enquiries currently slipping away</p>
          <p className="mt-2 text-4xl font-extrabold text-saffron" aria-live="polite">{fmt(result)}</p>
          <p className="mt-3 text-sm text-white/80">
            Formula: {e.toLocaleString("en-IN")} enquiries × {p}% missed × {fmt(v)} = {fmt(result)}
          </p>
          <p className="mt-3 text-xs text-white/70">
            This is an illustration based on the numbers you typed in, not a promise. Not every enquiry becomes a customer.
          </p>
        </div>
        <a
          href={waLink(`Hi Neovia AI, I use ~${e} enquiries a month and ~${p}% slip away. Want me to fix this? Can we talk?`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-6"
        >
          <WhatsAppIcon /> Want me to fix this? WhatsApp me
        </a>
      </div>
    </div>
  );
}
