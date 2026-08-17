-- Topstock EA — initial schema.
--
-- Apply via the Supabase SQL editor or `supabase db push`.
-- The site writes with the service-role key from a server route only, so RLS is
-- enabled with no permissive policies: nothing is reachable from the browser.

-- ---------------------------------------------------------------------------
-- Leads: trial and consultation requests (the only table Phase 3 writes to)
-- ---------------------------------------------------------------------------
create table if not exists trial_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null default 'trial'
    check (request_type in ('trial', 'consultation', 'both')),
  name text not null,
  email text not null,
  line_id text,
  telegram_id text,
  broker text,
  symbol text,
  timeframe text,
  experience text,
  message text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'purchased', 'declined')),
  contacted_at timestamptz,
  notes text,                -- internal notes, never surfaced on the site
  created_at timestamptz not null default now()
);

create index if not exists idx_trial_requests_status on trial_requests (status);
create index if not exists idx_trial_requests_created on trial_requests (created_at desc);
-- Supports the per-email rate limit lookup in /api/trial-request.
create index if not exists idx_trial_requests_email_created
  on trial_requests (email, created_at desc);

-- ---------------------------------------------------------------------------
-- Licenses (issued manually after payment is confirmed — Phase 4)
-- ---------------------------------------------------------------------------
create table if not exists licenses (
  id uuid primary key default gen_random_uuid(),
  license_key text unique not null,
  customer_email text not null,
  customer_name text,
  customer_line_id text,
  amount_thb int not null default 4900,
  payment_method text check (payment_method in ('promptpay', 'bank_transfer', 'stripe')),
  payment_reference text,
  status text not null default 'active'
    check (status in ('active', 'refunded', 'revoked')),
  issued_at timestamptz not null default now(),
  notes text,
  trial_request_id uuid references trial_requests (id)
);

create index if not exists idx_licenses_email on licenses (customer_email);

create table if not exists activations (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references licenses (id) on delete cascade,
  mt5_account text not null,
  broker text,
  activated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (license_id, mt5_account)
);

create table if not exists downloads (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references licenses (id),
  file_version text not null,
  ip_address inet,
  downloaded_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row level security
--
-- Enabled with no policies: the anon and authenticated roles get nothing.
-- The service-role key used by the server routes bypasses RLS by design, so
-- this locks the data to server-side access without blocking the site.
-- ---------------------------------------------------------------------------
alter table trial_requests enable row level security;
alter table licenses enable row level security;
alter table activations enable row level security;
alter table downloads enable row level security;
alter table contact_messages enable row level security;
