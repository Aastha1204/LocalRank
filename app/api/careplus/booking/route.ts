import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/rate-limit";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(`cpbook:${ip}`, 6, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please WhatsApp us instead." }, { status: 429 });
  }
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (clean(b.website, 200)) return NextResponse.json({ ok: true, saved: false }); // honeypot

  const name = clean(b.name, 80);
  const phone = clean(b.phone, 20);
  const service = clean(b.service, 120);
  const date = clean(b.date, 10);
  const slot = clean(b.slot, 30);
  const home = b.home === true;
  const address = clean(b.address, 200);

  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[+\d][\d\s-]{8,16}$/.test(phone)) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  if (!service) return NextResponse.json({ error: "Please choose a test." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Please choose a date." }, { status: 400 });
  if (home && address.length < 5) return NextResponse.json({ error: "Please enter your area/address for home collection." }, { status: 400 });

  // Bookings go to a Google Sheet through a Google Apps Script web app (see scripts/google-sheet-booking.gs).
  const hook = process.env.GOOGLE_SHEET_WEBHOOK;
  if (!hook) {
    console.warn("[careplus booking] GOOGLE_SHEET_WEBHOOK not set; booking not stored:", { name, service, date });
    return NextResponse.json({ ok: true, saved: false });
  }
  try {
    const r = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids a CORS-style preflight on Apps Script
      body: JSON.stringify({ token: process.env.GOOGLE_SHEET_TOKEN ?? "", name, phone, service, date, slot, home, address: home ? address : "" }),
      redirect: "follow",
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.ok !== true) throw new Error(`sheet responded ${r.status} ${JSON.stringify(j).slice(0, 120)}`);
  } catch (e) {
    console.error("[careplus booking] sheet error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Could not save your booking. Please WhatsApp us." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, saved: true });
}
