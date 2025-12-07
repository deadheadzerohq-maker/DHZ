create extension if not exists "pgcrypto";

create table if not exists carriers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  company_name text,
  mc_number text,
  is_active_subscriber boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists carrier_truck_intents (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references carriers(id) on delete cascade,
  origin_city text not null,
  origin_state text not null,
  dest_city text not null,
  dest_state text not null,
  equipment text not null,
  min_rate_per_mile numeric(10,2),
  available_date date not null,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists loads (
  id uuid primary key default gen_random_uuid(),
  posted_by_type text not null check (posted_by_type in ('broker','shipper')),
  company_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  origin_city text not null,
  origin_state text not null,
  dest_city text not null,
  dest_state text not null,
  equipment text not null,
  rate_total numeric(12,2),
  rate_per_mile numeric(10,2),
  miles numeric(10,2),
  pickup_date date not null,
  notes text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists intent_load_matches (
  id uuid primary key default gen_random_uuid(),
  carrier_intent_id uuid not null references carrier_truck_intents(id) on delete cascade,
  load_id uuid not null references loads(id) on delete cascade,
  match_score numeric(5,2) not null,
  sent_to_carrier boolean not null default false,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
