import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimited } from "@/lib/rate-limit";
import { BUSINESS_TYPES } from "@/config/site";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(`inq:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many messages. Please WhatsApp me instead." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: pretend success so bots move on.
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 80);
  const phone = clean(body.phone, 20);
  const business_type = clean(body.business_type, 60);
  const message = clean(body.message, 1000);

  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[+\d][\d\s-]{6,18}$/.test(phone)) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  if (!BUSINESS_TYPES.includes(business_type)) return NextResponse.json({ error: "Please choose a business type." }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[inquiry] Supabase env not set; dev mode, not saving:", { name, phone, business_type });
      return NextResponse.json({ ok: true, dev: true });
    }
    return NextResponse.json({ error: "Form is not available right now. Please WhatsApp me." }, { status: 503 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("inquiries").insert({ name, phone, business_type, message });
  if (error) {
    console.error("[inquiry] supabase error:", error.message);
    return NextResponse.json({ error: "Could not save your message. Please WhatsApp me." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
