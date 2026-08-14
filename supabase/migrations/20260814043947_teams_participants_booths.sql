create extension if not exists pgcrypto;

-- participants: natural key (student id), read-only roster today
create table participants (
  student_id text primary key,
  name text not null
);

-- staff: id is a stable slug used as the login identifier (admin/judge1/judge2)
create table staff (
  id text primary key,
  name text not null,
  role text not null check (role in ('admin', 'judge'))
);

insert into staff (id, name, role) values
  ('admin', '운영진', 'admin'),
  ('judge1', '심사위원 1', 'judge'),
  ('judge2', '심사위원 2', 'judge');

-- teams: tags/screenshot_urls have no per-item metadata, plain text[] is enough
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  image_url text,
  landing_page_url text,
  tags text[] not null default '{}',
  screenshot_urls text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- team_members: PK on student_id enforces "one team per participant" as a DB constraint
create table team_members (
  student_id text primary key references participants(student_id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade
);

-- booths: 1:1 with team, team_id is PK and FK
create table booths (
  team_id uuid primary key references teams(id) on delete cascade,
  zone text not null,
  number int not null
);

alter table participants enable row level security;
alter table staff enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table booths enable row level security;

create policy "public read" on participants for select using (true);
create policy "public read" on staff for select using (true);
create policy "public read" on teams for select using (true);
create policy "public read" on team_members for select using (true);
create policy "public read" on booths for select using (true);
