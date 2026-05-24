-- TripGenie Production Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  home_city text,
  avatar_url text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro', 'premium')),
  preferred_transport text[] default '{"flights","trains"}',
  preferences jsonb default '{"free_cancellation": true, "avoid_overnight": false, "eco_friendly": false}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trips table
create table if not exists public.trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  destination text not null,
  origin text not null,
  start_date date not null,
  end_date date not null,
  original_price numeric(10,2) not null,
  current_price numeric(10,2) not null,
  price_change numeric(10,2) default 0,
  image_url text default '',
  alert_active boolean default false,
  status text default 'saved' check (status in ('saved', 'booked', 'completed', 'cancelled')),
  trip_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bookings table
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  booking_ref text not null,
  destination text not null,
  origin text not null,
  dates text not null,
  status text default 'pending' check (status in ('confirmed', 'completed', 'pending', 'cancelled')),
  total_amount numeric(10,2) not null,
  segments jsonb default '[]',
  booked_on date default current_date,
  trip_id uuid references public.trips(id) on delete set null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_trips_user_id on public.trips(user_id);
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_trips_status on public.trips(status);
create index if not exists idx_bookings_status on public.bookings(status);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.bookings enable row level security;

-- Profiles: users can only read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trips: users can only access their own trips
create policy "Users can view own trips"
  on public.trips for select
  using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on public.trips for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trips"
  on public.trips for update
  using (auth.uid() = user_id);

create policy "Users can delete own trips"
  on public.trips for delete
  using (auth.uid() = user_id);

-- Bookings: users can only access their own bookings
create policy "Users can view own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bookings"
  on public.bookings for update
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create or replace trigger trips_updated_at
  before update on public.trips
  for each row execute function public.update_updated_at();
