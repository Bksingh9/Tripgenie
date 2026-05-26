-- Agency leads table for B2B sales pipeline
create table if not exists public.agency_leads (
  id uuid default gen_random_uuid() primary key,
  agency_name text not null,
  email text not null,
  phone text,
  plan text default 'starter',
  status text default 'new' check (status in ('new', 'contacted', 'demo', 'trial', 'converted', 'lost')),
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_agency_leads_status on public.agency_leads(status);
create index if not exists idx_agency_leads_email on public.agency_leads(email);

-- Allow inserts from anonymous users (lead capture form)
alter table public.agency_leads enable row level security;
create policy "Anyone can submit a lead"
  on public.agency_leads for insert
  with check (true);
