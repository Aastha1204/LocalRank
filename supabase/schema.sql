-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  business_type text not null,
  message text,
  created_at timestamptz not null default now()
);

-- Only the server (service role key) writes here. No public access.
alter table public.inquiries enable row level security;

-- UPI "I have paid" notes from the Book now flow. Verify each one in your UPI app before confirming.
create table if not exists public.payment_claims (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  project text,
  amount integer,
  utr text,
  created_at timestamptz not null default now()
);
alter table public.payment_claims enable row level security;

-- LocalRank audit leads (public audit page -> unlock report).
create table if not exists public.audit_leads (
  id uuid primary key default gen_random_uuid(),
  business text,
  area text,
  score integer,
  name text not null,
  whatsapp text not null,
  email text,
  status text not null default 'new' check (status in ('new','contacted','proposal','won')),
  notes text,
  created_at timestamptz not null default now()
);
alter table public.audit_leads enable row level security;
