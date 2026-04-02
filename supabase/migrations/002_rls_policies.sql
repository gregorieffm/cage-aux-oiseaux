-- =========================================================
-- Row Level Security Policies
-- =========================================================

-- Enable RLS on all tables
alter table properties enable row level security;
alter table seasonal_pricing enable row level security;
alter table blocked_dates enable row level security;
alter table ical_feeds enable row level security;
alter table bookings enable row level security;
alter table contact_submissions enable row level security;

-- Properties: public read, authenticated write
create policy "Properties are viewable by everyone"
  on properties for select using (true);

create policy "Properties are editable by service role"
  on properties for all using (auth.role() = 'service_role');

-- Seasonal pricing: public read
create policy "Seasonal pricing is viewable by everyone"
  on seasonal_pricing for select using (true);

create policy "Seasonal pricing is editable by service role"
  on seasonal_pricing for all using (auth.role() = 'service_role');

-- Blocked dates: public read (needed for availability calendar)
create policy "Blocked dates are viewable by everyone"
  on blocked_dates for select using (true);

create policy "Blocked dates are editable by service role"
  on blocked_dates for all using (auth.role() = 'service_role');

-- iCal feeds: service role only
create policy "iCal feeds are managed by service role"
  on ical_feeds for all using (auth.role() = 'service_role');

-- Bookings: guests can create, service role manages
create policy "Anyone can create bookings"
  on bookings for insert with check (true);

create policy "Guests can view their own bookings"
  on bookings for select using (guest_email = current_setting('request.jwt.claims', true)::json->>'email');

create policy "Service role manages all bookings"
  on bookings for all using (auth.role() = 'service_role');

-- Contact submissions: anyone can create, service role reads
create policy "Anyone can submit contact form"
  on contact_submissions for insert with check (true);

create policy "Service role manages contact submissions"
  on contact_submissions for all using (auth.role() = 'service_role');
