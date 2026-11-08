import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimited } from "@/lib/rate-limit";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(`audit:${ip}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (clean(body.website, 200)) return NextResponse.json({ ok: true }); // honeypot

  const name = clean(body.name, 80);
  const whatsapp = clean(body.whatsapp, 20);
  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[+\d][\d\s-]{8,16}$/.test(whatsapp)) return NextResponse.json({ error: "Enter a valid WhatsApp number." }, { status: 400 });

  const row = {
    business: clean(body.business, 120), area: clean(body.area, 60),
    score: Math.max(0, Math.min(100, Number(body.score) || 0)),
    name, whatsapp, email: clean(body.email, 120) || null,
  };

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    if (process.env.NODE_ENV !== "production") return NextResponse.json({ ok: true, dev: true });
    return NextResponse.json({ error: "Not available right now." }, { status: 503 });
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("audit_leads").insert(row);
  if (error) return NextResponse.json({ error: "Could not save." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
