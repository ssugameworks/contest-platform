-- applications: public recruitment intake form. Deliberately separate from
-- participants/teams (the currently-running demo-day roster) — this is
-- reviewed manually by admins and successful applicants get seeded into
-- participants/teams afterwards, same as today's manual onboarding.
create table applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  student_id text not null,
  college text not null,
  department text not null,
  phone text not null,
  birth_date date not null,
  role text not null check (role in ('pm', 'design', 'developer')),
  application_type text not null check (application_type in ('individual', 'team')),
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);
create unique index applications_student_id_key on applications (student_id);

-- Reference-only roster of teammates the applicant named for matching —
-- each teammate is expected to submit their own application separately, so
-- these rows carry no contact info, just enough to identify/cross-check them.
create table application_team_members (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  position int not null,
  name text not null,
  college text not null,
  department text not null
);
create index application_team_members_application_id_idx on application_team_members (application_id);

alter table applications enable row level security;
alter table application_team_members enable row level security;

-- No policies by design — every read/write goes through Server Actions using
-- createAdminClient() (service role, bypasses RLS), same as
-- participants/investors (see 20260814055714_tighten_rls_and_trade_lock.sql).
