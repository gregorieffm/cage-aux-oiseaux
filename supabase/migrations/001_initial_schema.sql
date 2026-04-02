-- =========================================================
-- Domaine La Cage aux Oiseaux — Database Schema
-- =========================================================

-- Properties (mirrors content collection, used for booking logic)
create table properties (
  id text primary key,
  name text not null,
  slug text unique not null,
  capacity int not null default 2,
  base_price_cents int not null default 0,
  min_nights int not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seasonal pricing per property
create table seasonal_pricing (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references properties(id) on delete cascade,
  label text not null,
  start_month int not null check (start_month between 1 and 12),
  end_month int not null check (end_month between 1 and 12),
  price_per_night_cents int not null,
  min_nights int not null default 1,
  created_at timestamptz not null default now()
);

-- Blocked dates (from iCal sync or manual blocks)
create table blocked_dates (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references properties(id) on delete cascade,
  date date not null,
  source text not null default 'manual',
  external_uid text,
  created_at timestamptz not null default now(),
  unique (property_id, date, source)
);

create index idx_blocked_dates_lookup on blocked_dates (property_id, date);

-- iCal feed configuration
create table ical_feeds (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references properties(id) on delete cascade,
  platform text not null,
  url text not null,
  last_synced_at timestamptz,
  last_error text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Bookings
create type booking_status as enum (
  'pending',
  'confirmed',
  'paid',
  'cancelled',
  'completed'
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references properties(id),
  status booking_status not null default 'pending',

  -- Guest info
  guest_name text not null,
  guest_email text not null,
  guest_phone text,

  -- Dates
  check_in date not null,
  check_out date not null,
  nights int generated always as (check_out - check_in) stored,

  -- Pricing
  price_per_night_cents int not null,
  total_cents int not null,
  extras_cents int not null default 0,

  -- Extras (JSON array of {name, price_cents, quantity})
  extras jsonb not null default '[]'::jsonb,

  -- Payment
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  paid_at timestamptz,

  -- Notes
  guest_message text,
  admin_notes text,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,

  constraint valid_dates check (check_out > check_in)
);

create index idx_bookings_property on bookings (property_id, check_in, check_out);
create index idx_bookings_status on bookings (status);
create index idx_bookings_email on bookings (guest_email);
create index idx_bookings_stripe on bookings (stripe_payment_intent_id);

-- Contact form submissions
create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  dates text,
  property_slug text,
  message text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_properties_updated
  before update on properties
  for each row execute function update_updated_at();

create trigger trg_bookings_updated
  before update on bookings
  for each row execute function update_updated_at();

-- Seed properties
insert into properties (id, name, slug, capacity, base_price_cents, min_nights) values
  ('cabane-leo', 'La Cabane de Léo', 'cabane-leo', 2, 22500, 1),
  ('nuit-insolite', 'Une Nuit Insolite', 'nuit-insolite', 2, 0, 1),
  ('suite-nordique', 'La Suite Nordique', 'suite-nordique', 2, 0, 1),
  ('larguez-amarres', 'Larguez les Amarres', 'larguez-amarres', 5, 0, 1),
  ('chambres-hotes', 'Les Chambres d''Hôtes', 'chambres-hotes', 2, 0, 1);

-- Seed seasonal pricing for Cabane de Léo
insert into seasonal_pricing (property_id, label, start_month, end_month, price_per_night_cents, min_nights) values
  ('cabane-leo', 'Basse saison', 11, 3, 22500, 1),
  ('cabane-leo', 'Moyenne saison', 4, 6, 25000, 2),
  ('cabane-leo', 'Haute saison', 7, 10, 28000, 2);
