import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[careplus booking] Supabase env not set; booking not stored:", { name, service, date });
    return NextResponse.json({ ok: true, saved: false });
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("careplus_bookings").insert({ name, phone, service, date, slot, home, address: home ? address : null });
  if (error) {
    console.error("[careplus booking] supabase error:", error.message);
    return NextResponse.json({ error: "Could not save your booking. Please WhatsApp us." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, saved: true });
}
