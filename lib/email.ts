import { CONTACT, OWNER } from "@/config/site";

export type ReceiptData = {
  id: string;
  orderId?: string;
  amount: number; // rupees
  method: string;
  status: string;
  date: string;
  name: string;
  phone: string;
  email?: string;
  project: string;
};

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function receiptHtml(r: ReceiptData) {
  const row = (k: string, v: string) => `<tr><td style="padding:6px 12px 6px 0;color:#555">${k}</td><td style="padding:6px 0;font-weight:600">${esc(v)}</td></tr>`;
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #ddd;border-radius:12px">
    <h2 style="margin:0 0 4px;color:#1F2340">${esc(OWNER.brand)}</h2><p style="margin:0 0 16px;color:#555">Payment receipt</p>
    <table>${row("Receipt / payment ID", r.id)}${r.orderId ? row("Order ID", r.orderId) : ""}${row("Date", r.date)}${row("Project", r.project)}${row("Amount", inr(r.amount))}${row("Method", r.method)}${row("Status", r.status)}${row("Name", r.name)}${row("Phone", r.phone)}${r.email ? row("Email", r.email) : ""}</table>
    <p style="margin-top:16px;color:#555;font-size:13px">Questions? Reply to this email or WhatsApp ${esc(CONTACT.phone)}.</p></div>`;
}

/** Sends email through Resend if RESEND_API_KEY is set. Returns false (and does nothing) otherwise. */
export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return false;
  const from = process.env.RECEIPT_FROM || `${OWNER.brand} <onboarding@resend.dev>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) console.error("[email] resend failed", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("[email] failed", e);
    return false;
  }
}
