"use client";
import Image from "next/image";
import { OWNER, waLink } from "@/config/site";
import type { ReceiptData } from "@/lib/email";
import { WhatsAppIcon } from "./Icons";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export default function Receipt({ r, emailed }: { r: ReceiptData; emailed?: boolean }) {
  const pending = /pending/i.test(r.status);
  const rows: [string, string][] = [
    ["Receipt / payment ID", r.id],
    ...(r.orderId ? ([["Order ID", r.orderId]] as [string, string][]) : []),
    ["Date", r.date],
    ["Project", r.project],
    ["Amount", r.amount ? inr(r.amount) : "As agreed"],
    ["Method", r.method],
    ["Status", r.status],
    ["Name", r.name],
    ["Phone", r.phone],
    ...(r.email ? ([["Email", r.email]] as [string, string][]) : []),
  ];
  const wa = waLink(
    `Hi ${OWNER.brand}, ${pending ? "I have paid by UPI" : "I have paid"}.\nProject: ${r.project}\nAmount: ${r.amount ? inr(r.amount) : "as agreed"}\nRef: ${r.id}\nName: ${r.name}`,
  );

  return (
    <div>
      <div className="receipt-print rounded-2xl border border-ink/15 bg-white p-5 text-ink">
        <div className="flex items-center gap-3 border-b border-ink/10 pb-3">
          <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-lg" />
          <div>
            <p className="font-extrabold">{OWNER.brand}</p>
            <p className="text-sm text-ink/70">Payment receipt</p>
          </div>
        </div>
        <dl className="mt-3 space-y-1.5 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4"><dt className="text-ink/70">{k}</dt><dd className="break-all text-right font-bold">{v}</dd></div>
          ))}
        </dl>
        {pending && <p className="mt-3 rounded-lg bg-saffron/25 p-3 text-xs font-semibold">UPI payments go straight to my bank account. I will check it and confirm on WhatsApp. This note is not a final receipt until then.</p>}
      </div>
      <p className="mt-3 text-sm text-ink/80">
        {emailed ? "A copy was also sent to your email." : r.email && !pending ? "Your bank or Razorpay may also email you a receipt." : ""}
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => window.print()} className="btn btn-dark px-5 py-2.5 text-sm">Print / save as PDF</button>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-wa px-5 py-2.5 text-sm"><WhatsAppIcon /> Send this receipt to {OWNER.brand} on WhatsApp</a>
      </div>
    </div>
  );
}
