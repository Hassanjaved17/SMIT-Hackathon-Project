-- MaintainIQ Supabase schema
-- Run this in the Supabase SQL editor for a fresh project.

create extension if not exists "pgcrypto";

-- Profiles: extends auth.users with role info
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'technician')) default 'technician',
  created_at timestamptz not null default now()
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text not null,
  location text not null,
  condition text not null default 'Good',
  status text not null default 'Operational'
    check (status in ('Operational','Issue Reported','Under Inspection','Under Maintenance','Out of Service','Retired')),
  last_service_date date,
  next_service_date date,
  assigned_technician uuid references profiles(id),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists issues (
  id uuid primary key default gen_random_uuid(),
  issue_number text not null unique,
  asset_id uuid not null references assets(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null default 'General',
  priority text not null default 'Medium' check (priority in ('Low','Medium','High','Critical')),
  status text not null default 'Reported'
    check (status in ('Reported','Assigned','Inspection Started','Maintenance In Progress','Waiting for Parts','Resolved','Closed','Reopened')),
  reporter_name text not null,
  reporter_contact text,
  assigned_technician uuid references profiles(id),
  ai_suggested_title boolean default false,
  ai_suggested_category boolean default false,
  ai_suggested_priority boolean default false,
  ai_possible_causes jsonb default '[]',
  ai_initial_checks jsonb default '[]',
  evidence_url text,
  created_at timestamptz not null default now()
);

create table if not exists maintenance_records (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  technician text not null,
  notes text not null,
  parts_used text,
  cost numeric not null default 0 check (cost >= 0),
  time_spent_minutes int default 0,
  final_condition text,
  evidence_url text,
  created_at timestamptz not null default now()
);

create table if not exists history (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  issue_id uuid references issues(id) on delete set null,
  actor text not null,
  action text not null,
  created_at timestamptz not null default now()
);

-- next_service_date must not precede maintenance completion date
alter table assets add constraint next_service_after_last
  check (next_service_date is null or last_service_date is null or next_service_date >= last_service_date);

-- Row Level Security
alter table profiles enable row level security;
alter table assets enable row level security;
alter table issues enable row level security;
alter table maintenance_records enable row level security;
alter table history enable row level security;

-- Public (anon) users can read assets/history for the public asset page,
-- and insert issues (reporting), but cannot see internal profile data.
create policy "public read assets" on assets for select using (true);
create policy "public read history" on history for select using (true);
create policy "public insert issues" on issues for insert with check (true);
create policy "public read own issue" on issues for select using (true);

create policy "authenticated manage assets" on assets for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated manage issues" on issues for update
  using (auth.role() = 'authenticated');
create policy "authenticated manage maintenance" on maintenance_records for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated insert history" on history for insert
  with check (auth.role() = 'authenticated');
create policy "users read own profile" on profiles for select using (auth.uid() = id or auth.role() = 'authenticated');
create policy "users update own profile" on profiles for update using (auth.uid() = id);
create policy "users insert own profile" on profiles for insert with check (auth.uid() = id);

-- Seed demo assets
insert into assets (code, name, category, location, condition, status, last_service_date, next_service_date)
values
  ('AST-0001', 'Classroom Projector 01', 'Electronics', 'Room 204, Block B', 'Good', 'Operational', '2026-05-01', '2026-11-01'),
  ('AST-0002', 'Central AC Unit - Lobby', 'HVAC', 'Ground Floor Lobby', 'Fair', 'Operational', '2026-04-15', '2026-10-15'),
  ('AST-0003', 'Fire Extinguisher - Lab 3', 'Safety', 'Science Lab 3', 'Good', 'Operational', '2026-06-01', '2026-12-01'),
  ('AST-0004', 'Elevator - East Wing', 'Mechanical', 'East Wing', 'Good', 'Operational', '2026-03-20', '2026-09-20'),
  ('AST-0005', 'Water Cooler - Cafeteria', 'Plumbing', 'Cafeteria', 'Fair', 'Operational', '2026-05-10', '2026-11-10')
on conflict (code) do nothing;
