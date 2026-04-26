-- Tripgenie initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Tables store trip search payloads as JSONB so the schema doesn't have to
-- track every Amadeus field; the frontend renders directly from option JSON.

create extension if not exists "pgcrypto";

create table if not exists public.saved_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  search jsonb not null,
  option jsonb not null,
  original_price integer not null,
  alert_active boolean not null default true,
  saved_at timestamptz not null default now()
);

create index if not exists saved_trips_user_id_idx on public.saved_trips (user_id);
create index if not exists saved_trips_saved_at_idx on public.saved_trips (saved_at desc);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  search jsonb not null,
  option jsonb not null,
  status text not null check (status in ('confirmed', 'completed', 'pending', 'cancelled')),
  total_amount integer not null,
  booked_at timestamptz not null default now()
);

create index if not exists bookings_user_id_idx on public.bookings (user_id);
create index if not exists bookings_booked_at_idx on public.bookings (booked_at desc);
create index if not exists bookings_code_idx on public.bookings (code);

-- Row Level Security: each user only sees their own rows.
alter table public.saved_trips enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "saved_trips owner read" on public.saved_trips;
create policy "saved_trips owner read"
  on public.saved_trips for select
  using (auth.uid() = user_id);

drop policy if exists "saved_trips owner write" on public.saved_trips;
create policy "saved_trips owner write"
  on public.saved_trips for insert
  with check (auth.uid() = user_id);

drop policy if exists "saved_trips owner update" on public.saved_trips;
create policy "saved_trips owner update"
  on public.saved_trips for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "saved_trips owner delete" on public.saved_trips;
create policy "saved_trips owner delete"
  on public.saved_trips for delete
  using (auth.uid() = user_id);

drop policy if exists "bookings owner read" on public.bookings;
create policy "bookings owner read"
  on public.bookings for select
  using (auth.uid() = user_id);

drop policy if exists "bookings owner write" on public.bookings;
create policy "bookings owner write"
  on public.bookings for insert
  with check (auth.uid() = user_id);

drop policy if exists "bookings owner update" on public.bookings;
create policy "bookings owner update"
  on public.bookings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "bookings owner delete" on public.bookings;
create policy "bookings owner delete"
  on public.bookings for delete
  using (auth.uid() = user_id);
