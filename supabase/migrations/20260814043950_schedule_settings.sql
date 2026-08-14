-- schedule_items: stores starts_at only; status ("done"/"current"/"upcoming") is
-- computed at query time from the real clock instead of being hand-set per row.
create table schedule_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null
);

-- app_settings: single-row settings table for scoreWeights.investmentPercent
create table app_settings (
  id boolean primary key default true check (id),
  investment_percent smallint not null default 50
    check (investment_percent between 0 and 100)
);

insert into app_settings (id) values (true);

alter table schedule_items enable row level security;
alter table app_settings enable row level security;

create policy "public read" on schedule_items for select using (true);
create policy "public read" on app_settings for select using (true);
