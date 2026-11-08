import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimited } from "@/lib/rate-limit";
import { CONTACT } from "@/config/site";
import { receiptHtml, sendEmail, type ReceiptData } from "@/lib/email";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * UPI payments go straight to the owner's bank, so the site cannot confirm them. This records the customer's "I have paid" note
 * (Supabase table payment_claims, plus an email to the owner if RESEND_API_KEY is set). The owner checks it in the UPI app, then confirms.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(`claim:${ip}`, 8, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many attempts. Please WhatsApp me instead." }, { status: 429 });
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const name = clean(b.name, 80), phone = clean(b.phone, 20), email = clean(b.email, 120), utr = clean(b.utr, 40);
  const project = clean(b.project, 120) || "Project payment";
  const amount = Math.round(Number(b.amount)) || 0;
  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[+\d][\d\s-]{6,18}$/.test(phone)) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "That email does not look right." }, { status: 400 });

  const receipt: ReceiptData = {
    id: utr ? `UPI-${utr}` : `UPI-${Date.now()}`, amount, method: "UPI", status: "Pending verification",
    date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), name, phone, email: email || undefined, project,
  };

  let saved = false;
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const { error } = await createClient(url, key, { auth: { persistSession: false } }).from("payment_claims").insert({ name, phone, email, project, amount, utr });
    if (error) console.error("[claim] supabase error:", error.message); else saved = true;
  }
  const html = receiptHtml(receipt);
  const mailed = (await Promise.all([
    email ? sendEmail(email, `We received your payment note, ${project}`, html) : false,
    sendEmail(CONTACT.email, `UPI payment claimed: ${project} (₹${amount.toLocaleString("en-IN")})`, html),
  ])).some(Boolean);

  return NextResponse.json({ ok: true, saved, mailed, receipt });
}
