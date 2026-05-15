-- K Beauty Retail: landing CMS + contact inquiries (service role from app only)
-- Run in Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  company text,
  inquiry_type text not null,
  message text not null,
  read_at timestamptz,
  source text not null default 'website'
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

alter table public.contact_submissions enable row level security;

-- No policies: only the Supabase service role (server) can access this table.

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- Optional: allow authenticated dashboard users to read/write via Supabase Auth later.
-- For now, all access is through your app server using the service role key.
