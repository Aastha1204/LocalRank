import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/rate-limit";
import { ADVANCE_PERCENT, DEMOS } from "@/config/site";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Creates a Razorpay order. For a "Book now" project the amount must be the advance or full price from config/site.ts. */
export async function POST(req: Request) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) return NextResponse.json({ error: "Card payments are not switched on yet. Please pay by UPI or WhatsApp me." }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(`pay:${ip}`, 10, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const amount = Math.round(Number(body.amount));
  const name = clean(body.name, 80);
  const phone = clean(body.phone, 20);
  const email = clean(body.email, 120);
  const note = clean(body.note, 120);
  const demoSlug = clean(body.demo, 60);

  if (!Number.isFinite(amount) || amount < 100 || amount > 500000) return NextResponse.json({ error: "Enter an amount between ₹100 and ₹5,00,000." }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[+\d][\d\s-]{6,18}$/.test(phone)) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email so I can send your receipt." }, { status: 400 });

  let project = note || "Project payment";
  if (demoSlug) {
    const d = DEMOS.find((x) => x.slug === demoSlug);
    if (!d) return NextResponse.json({ error: "Unknown project." }, { status: 400 });
    project = d.title;
    if (d.price) {
      const allowed = [Math.round((d.price * ADVANCE_PERCENT) / 100), d.price];
      if (!allowed.includes(amount)) return NextResponse.json({ error: "That amount does not match this project." }, { status: 400 });
    }
  }

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${keyId}:${secret}`).toString("base64") },
    body: JSON.stringify({ amount: amount * 100, currency: "INR", receipt: `neovia_${Date.now()}`, notes: { name, phone, email, project } }),
  });
  if (!res.ok) {
    console.error("[payment] razorpay order failed", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: "Could not start the payment. Please try UPI or WhatsApp me." }, { status: 502 });
  }
  const order = (await res.json()) as { id: string; amount: number };
  return NextResponse.json({ orderId: order.id, amount: order.amount, keyId, project });
}
