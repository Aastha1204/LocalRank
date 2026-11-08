import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import { rateLimited } from "@/lib/rate-limit";

const STATUSES = ["new", "confirmed", "done", "cancelled"];

function authorised(req: Request) {
  const expected = process.env.ADMIN_KEY;
  const given = req.headers.get("x-admin-key") ?? "";
  if (!expected || !given) return false;
  const a = Buffer.from(given), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(`cpadmin:${ip}`, 30, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  if (!process.env.ADMIN_KEY) return NextResponse.json({ error: "ADMIN_KEY is not set on the server." }, { status: 503 });
  if (!authorised(req)) return NextResponse.json({ error: "Wrong admin key." }, { status: 401 });
  const supabase = db();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 503 });
  const { data, error } = await supabase.from("careplus_bookings").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookings: data });
}

export async function PATCH(req: Request) {
  if (!authorised(req)) return NextResponse.json({ error: "Wrong admin key." }, { status: 401 });
  const supabase = db();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 503 });
  let b: { id?: string; status?: string };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!b.id || !b.status || !STATUSES.includes(b.status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  const { error } = await supabase.from("careplus_bookings").update({ status: b.status }).eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
