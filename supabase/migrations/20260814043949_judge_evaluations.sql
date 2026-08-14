-- judge_evaluations: composite PK (judge_id, team_id) matches how the app already
-- keys evaluations. criteria_scores is jsonb, not a normalized join table, since
-- rubric criteria are a fixed 4-item TS constant, not DB-editable.
create table judge_evaluations (
  judge_id text not null references staff(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  criteria_scores jsonb not null default '{}'::jsonb,
  memo text not null default '',
  submitted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (judge_id, team_id)
);

alter table judge_evaluations enable row level security;

create policy "public read" on judge_evaluations for select using (true);
