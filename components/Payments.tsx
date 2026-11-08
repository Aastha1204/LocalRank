"use client";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { ADVANCE_PERCENT, OWNER, PAYMENTS } from "@/config/site";
import type { ReceiptData } from "@/lib/email";
import Receipt from "./Receipt";

declare global {
  interface Window { Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void } }
}

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const field = "mt-1 w-full rounded-xl border border-ink/20 bg-white px-4 py-3";

function loadCheckout() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type Ctx = { project: string; demoSlug?: string; amount: string; locked: boolean };

/* ---------- card / net banking / wallet (Razorpay) ---------- */
function CardPay({ enabled, ctx, onPaid }: { enabled: boolean; ctx: Ctx; onPaid: (r: ReceiptData) => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!enabled) return;
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/payment/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start the payment.");
      if (!(await loadCheckout()) || !window.Razorpay) throw new Error("Could not load the payment window. Check your internet and try again.");

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: "INR",
        name: OWNER.brand,
        description: data.project,
        image: `${window.location.origin}/logo.png`,
        prefill: { name: f.name, email: f.email, contact: f.phone },
        theme: { color: "#1F2340" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (r: Record<string, string>) => {
          const v = await fetch("/api/payment/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) });
          const out = await v.json().catch(() => ({}));
          if (v.ok && out.receipt) onPaid(out.receipt as ReceiptData);
          else { setMsg("We could not confirm the payment. If money was deducted, WhatsApp me with your payment ID."); setBusy(false); }
        },
      });
      rzp.on("payment.failed", () => { setMsg("The payment did not go through. You were not charged. Please try again or use UPI."); setBusy(false); });
      rzp.open();
    } catch (err) {
      setMsg((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input type="hidden" name="demo" value={ctx.demoSlug ?? ""} />
      <input type="hidden" name="note" value={ctx.project} />
      <label className="block text-sm font-bold">Your name<input name="name" required maxLength={80} autoComplete="name" className={field} /></label>
      <label className="block text-sm font-bold">Phone number<input name="phone" required type="tel" inputMode="tel" maxLength={20} autoComplete="tel" className={field} /></label>
      <label className="block text-sm font-bold">Email (your receipt is sent here)<input name="email" required type="email" maxLength={120} autoComplete="email" className={field} /></label>
      <label className="block text-sm font-bold">
        Amount (₹)
        <input name="amount" required type="number" inputMode="numeric" min={100} max={500000} step={1} defaultValue={ctx.amount} readOnly={ctx.locked} className={`${field} ${ctx.locked ? "bg-mist" : ""}`} />
      </label>
      {!ctx.demoSlug && <p className="-mt-1 text-xs text-ink/70">Paying for: {ctx.project}</p>}
      {msg && <p role="alert" className="text-sm font-semibold text-red-700">{msg}</p>}
      <button type="submit" disabled={!enabled || busy} className="btn btn-primary w-full disabled:opacity-60">
        {busy ? "Opening secure payment…" : `Pay ${ctx.amount ? inr(Number(ctx.amount)) : ""} by card, net banking or wallet`}
      </button>
      {!enabled && <p className="text-xs text-ink/70">Card payments are being switched on. Until then, please pay by UPI or WhatsApp me.</p>}
      <p className="text-xs text-ink/70">Cards, net banking (all major banks), UPI and wallets, handled securely by Razorpay. I never see your card details.</p>
    </form>
  );
}

/* ---------- UPI ---------- */
type UpiApp = { name: string; pkg?: string; ios?: string };

// Android: opens that exact app through its package name. iPhone: the app's own link where one is known,
// otherwise the system UPI chooser. Everything else falls back to the generic upi:// link.
const UPI_APPS: UpiApp[] = [
  { name: "Google Pay", pkg: "com.google.android.apps.nbu.paisa.user", ios: "gpay://upi/pay" },
  { name: "PhonePe", pkg: "com.phonepe.app", ios: "phonepe://pay" },
  { name: "Paytm", pkg: "net.one97.paytm", ios: "paytmmp://pay" },
  { name: "BHIM", pkg: "in.org.npci.upiapp" },
  { name: "super.money", pkg: "money.super.payments" },
  { name: "Amazon Pay", pkg: "in.amazon.mShop.android.shopping" },
  { name: "CRED", pkg: "com.dreamplug.androidapp", ios: "credpay://upi/pay" },
  { name: "WhatsApp", pkg: "com.whatsapp" },
  { name: "MobiKwik", pkg: "com.mobikwik_new" },
  { name: "Freecharge", pkg: "com.freecharge.android" },
  { name: "Navi", pkg: "com.naviapp" },
  { name: "SBI YONO", pkg: "com.sbi.lotusintouch" },
  { name: "iMobile Pay (ICICI)", pkg: "com.csam.icici.bank.imobile" },
  { name: "HDFC PayZapp", pkg: "com.enstage.wibmo.hdfc" },
  { name: "Axis Mobile", pkg: "com.upi.axisbank" },
  { name: "Other UPI app" },
];
const COLORS = ["bg-teal/40", "bg-saffron/40", "bg-ink/10", "bg-[#cfd3f5]"];

function upiParams(amount: string, project: string) {
  const p = new URLSearchParams({ pa: PAYMENTS.upiId, pn: PAYMENTS.payeeName, cu: "INR", tn: `${OWNER.brand}: ${project}`.slice(0, 60) });
  const a = Math.round(Number(amount));
  if (a >= 1) p.set("am", String(a));
  return p.toString();
}

function appHref(app: UpiApp, ctx: Ctx, ua: string) {
  const q = upiParams(ctx.amount, ctx.project);
  if (/Android/i.test(ua) && app.pkg) return `intent://pay?${q}#Intent;scheme=upi;package=${app.pkg};end`;
  if (/iPhone|iPad|iPod/i.test(ua) && app.ios) return `${app.ios}?${q}`;
  return `upi://pay?${q}`;
}

/** "I have paid" note. UPI goes straight to the owner's bank, so this is how the owner gets notified. */
function PaidNote({ ctx, onDone }: { ctx: Ctx; onDone: (r: ReceiptData, emailed: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/payment/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, amount: ctx.amount, project: ctx.project }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      onDone(data.receipt as ReceiptData, Boolean(data.mailed));
    } catch (err) {
      setMsg((err as Error).message);
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl bg-mist p-4">
      <p className="font-extrabold">Already paid? Get your receipt</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-bold">Your name<input name="name" required maxLength={80} autoComplete="name" className={field} /></label>
        <label className="block text-sm font-bold">Phone<input name="phone" required type="tel" inputMode="tel" maxLength={20} autoComplete="tel" className={field} /></label>
        <label className="block text-sm font-bold">Email (optional)<input name="email" type="email" maxLength={120} autoComplete="email" className={field} /></label>
        <label className="block text-sm font-bold">UPI reference / UTR (optional)<input name="utr" maxLength={40} className={field} /></label>
      </div>
      {msg && <p role="alert" className="text-sm font-semibold text-red-700">{msg}</p>}
      <button type="submit" disabled={busy} className="btn btn-dark w-full disabled:opacity-60 sm:w-auto">{busy ? "Sending…" : "I have paid, send my receipt"}</button>
    </form>
  );
}

/* ---------- the whole flow ---------- */
type Step = "amount" | "method" | "upi" | "qr" | "card" | "receipt";

export function PaymentFlow({ cardEnabled, project = "Project payment", demoSlug, price }: { cardEnabled: boolean; project?: string; demoSlug?: string; price?: number | null }) {
  const hasPrice = Boolean(demoSlug && price);
  const advance = price ? Math.round((price * ADVANCE_PERCENT) / 100) : 0;
  const [step, setStep] = useState<Step>(hasPrice ? "amount" : "method");
  const [amount, setAmount] = useState(hasPrice ? String(advance) : "");
  const [receipt, setReceipt] = useState<{ r: ReceiptData; emailed: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const ua = useSyncExternalStore(() => () => {}, () => navigator.userAgent, () => "");
  const mobile = /Android|iPhone|iPad|iPod/i.test(ua);
  const ctx: Ctx = { project, demoSlug, amount, locked: hasPrice };

  const copy = async () => {
    try { await navigator.clipboard.writeText(PAYMENTS.upiId); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  };
  const back = (to: Step) => <button type="button" onClick={() => setStep(to)} className="mb-4 text-sm font-bold text-teal-dark underline underline-offset-4">← Back</button>;
  const b = PAYMENTS.bank;
  const summary = amount ? <p className="mb-3 rounded-lg bg-mist px-3 py-2 text-sm"><span className="font-bold">{project}</span> · {inr(Number(amount))}</p> : null;

  if (step === "receipt" && receipt) return <Receipt r={receipt.r} emailed={receipt.emailed} />;

  return (
    <div>
      {step === "amount" && price && (
        <div>
          <p className="font-extrabold">How much would you like to pay now?</p>
          <div role="radiogroup" aria-label="Amount" className="mt-3 space-y-3">
            {[{ label: `${ADVANCE_PERCENT}% advance to start`, v: advance }, { label: "Full payment", v: price }].map((o) => (
              <label key={o.label} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-4 ${amount === String(o.v) ? "border-saffron bg-saffron/10" : "border-ink/15"}`}>
                <span className="flex items-center gap-3"><input type="radio" name="amt" checked={amount === String(o.v)} onChange={() => setAmount(String(o.v))} className="h-5 w-5 accent-[#1F2340]" /><span className="font-bold">{o.label}</span></span>
                <span className="text-lg font-extrabold">{inr(o.v)}</span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink/80">{PAYMENTS.note}</p>
          <button type="button" onClick={() => setStep("method")} className="btn btn-primary mt-4 w-full">Pay now</button>
        </div>
      )}

      {step === "method" && (
        <div>
          {hasPrice && back("amount")}
          {summary}
          <p className="font-bold">How would you like to pay?</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <button type="button" onClick={() => setStep("upi")} className="rounded-2xl border-2 border-ink/15 p-5 text-left transition hover:border-saffron hover:bg-mist">
              <span className="text-xl font-extrabold">UPI</span>
              <span className="mt-1 block text-sm text-ink/80">Google Pay, PhonePe, Paytm, BHIM and every other UPI app, or scan a QR code.</span>
            </button>
            <button type="button" onClick={() => setStep("card")} className="rounded-2xl border-2 border-ink/15 p-5 text-left transition hover:border-saffron hover:bg-mist">
              <span className="text-xl font-extrabold">Net banking / Card</span>
              <span className="mt-1 block text-sm text-ink/80">Debit and credit cards, net banking of all major banks, and wallets.</span>
            </button>
          </div>
          {!hasPrice && <p className="mt-4 text-sm text-ink/80">{PAYMENTS.note}</p>}
        </div>
      )}

      {step === "upi" && (
        <div>
          {back("method")}
          {summary}
          <h3 className="text-xl font-extrabold">Choose your UPI app</h3>
          {!hasPrice && (
            <label className="mt-3 block text-sm font-bold">
              Amount in ₹ (optional)
              <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="e.g. 7500" className="mt-1 w-full max-w-xs rounded-xl border border-ink/20 bg-white px-4 py-3" />
            </label>
          )}
          {!mobile && <p className="mt-3 rounded-lg bg-saffron/25 p-3 text-sm font-semibold">UPI apps open on a phone. On a computer, tap “Scan QR code instead” below and scan it with your phone.</p>}
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {UPI_APPS.map((app, i) => (
              <li key={app.name}>
                <a href={appHref(app, ctx, ua)} className="flex h-full items-center gap-3 rounded-xl border border-ink/15 p-3 text-sm font-bold hover:bg-mist">
                  <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${COLORS[i % COLORS.length]}`}>{app.name[0]}</span>
                  {app.name}
                </a>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setStep("qr")} className="btn btn-primary mt-5 w-full sm:w-auto">Scan QR code instead</button>
          <p className="mt-3 text-xs text-ink/70">If an app does not open, pick “Other UPI app” or scan the QR code.</p>
          <PaidNote ctx={ctx} onDone={(r, emailed) => { setReceipt({ r, emailed }); setStep("receipt"); }} />
        </div>
      )}

      {step === "qr" && (
        <div>
          {back("upi")}
          {summary}
          <h3 className="text-xl font-extrabold">Scan with any UPI app</h3>
          <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <Image src={PAYMENTS.qrImage} alt={`UPI QR code for ${PAYMENTS.upiId}`} width={220} height={220} unoptimized className="h-52 w-52 rounded-xl border border-ink/10" />
            <div className="w-full space-y-3 text-sm">
              {amount && <p className="font-bold">Enter {inr(Number(amount))} in your app after scanning.</p>}
              <p className="font-semibold">Or pay to this UPI ID:</p>
              <p className="break-all rounded-lg bg-mist px-3 py-2 font-mono text-base font-bold">{PAYMENTS.upiId}</p>
              <button type="button" onClick={copy} className="btn btn-ghost px-4 py-2 text-sm text-ink">{copied ? "Copied ✓" : "Copy UPI ID"}</button>
            </div>
          </div>
          <PaidNote ctx={ctx} onDone={(r, emailed) => { setReceipt({ r, emailed }); setStep("receipt"); }} />
        </div>
      )}

      {step === "card" && (
        <div>
          {back("method")}
          <h3 className="text-xl font-extrabold">Pay by card, net banking or wallet</h3>
          <div className="mt-4"><CardPay enabled={cardEnabled} ctx={ctx} onPaid={(r) => { setReceipt({ r, emailed: true }); setStep("receipt"); }} /></div>
          {b.accountNumber && b.ifsc && (
            <div className="mt-6 border-t border-ink/10 pt-5">
              <h4 className="font-extrabold">Or bank transfer (NEFT / IMPS / RTGS)</h4>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="font-bold">Account name</dt><dd>{b.accountName}</dd></div>
                <div><dt className="font-bold">Bank</dt><dd>{b.bankName}</dd></div>
                <div><dt className="font-bold">Account number</dt><dd className="font-mono">{b.accountNumber}</dd></div>
                <div><dt className="font-bold">IFSC</dt><dd className="font-mono">{b.ifsc}</dd></div>
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- the collapsible section on the page ---------- */
export default function Payments({ cardEnabled }: { cardEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(0); // remount to reset the flow when closed
  return (
    <div className="mt-8 max-w-3xl">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="pay-panel"
        onClick={() => { if (open) setN((x) => x + 1); setOpen((o) => !o); }}
        className="btn btn-dark w-full justify-between px-6 py-4 text-lg"
      >
        Payment options <span aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      <div id="pay-panel" hidden={!open} className="card mt-4 p-6">
        <PaymentFlow key={n} cardEnabled={cardEnabled} />
      </div>
    </div>
  );
}
