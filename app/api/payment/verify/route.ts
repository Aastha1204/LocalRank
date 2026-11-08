import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { CONTACT } from "@/config/site";
import { receiptHtml, sendEmail, type ReceiptData } from "@/lib/email";

/**
 * Confirms the signature Razorpay returns, then reads the payment from Razorpay (so the receipt shows the real amount),
 * emails the receipt to the customer and to the owner (if RESEND_API_KEY is set), and returns the receipt for the page.
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!secret || !keyId) return NextResponse.json({ ok: false }, { status: 503 });
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  const order = String(b.razorpay_order_id ?? ""), pay = String(b.razorpay_payment_id ?? ""), sig = String(b.razorpay_signature ?? "");

  const expected = createHmac("sha256", secret).update(`${order}|${pay}`).digest("hex");
  const x = Buffer.from(expected), y = Buffer.from(sig);
  if (!(x.length === y.length && timingSafeEqual(x, y))) return NextResponse.json({ ok: false }, { status: 400 });

  // Signature is valid. Read the payment details for the receipt.
  let receipt: ReceiptData = {
    id: pay, orderId: order, amount: 0, method: "Online", status: "Paid",
    date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), name: "", phone: "", project: "Project payment",
  };
  try {
    const r = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(pay)}`, {
      headers: { Authorization: "Basic " + Buffer.from(`${keyId}:${secret}`).toString("base64") },
    });
    if (r.ok) {
      const p = (await r.json()) as { amount: number; method?: string; status: string; email?: string; contact?: string; created_at: number; notes?: Record<string, string> };
      receipt = {
        ...receipt,
        amount: p.amount / 100,
        method: p.method ? p.method.replace(/^./, (c) => c.toUpperCase()) : "Online",
        status: p.status === "captured" ? "Paid" : p.status === "authorized" ? "Authorised (will be captured)" : p.status,
        date: new Date(p.created_at * 1000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        name: p.notes?.name ?? "", phone: p.notes?.phone ?? p.contact ?? "", email: p.notes?.email ?? p.email,
        project: p.notes?.project ?? receipt.project,
      };
    }
  } catch (e) { console.error("[payment] could not read payment", e); }

  const html = receiptHtml(receipt);
  await Promise.all([
    receipt.email ? sendEmail(receipt.email, `Your payment receipt, ${receipt.project}`, html) : false,
    sendEmail(CONTACT.email, `Payment received: ${receipt.project} (₹${receipt.amount.toLocaleString("en-IN")})`, html),
  ]);
  return NextResponse.json({ ok: true, receipt });
}
