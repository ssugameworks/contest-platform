-- investors: kept separate from participants (confirmed decision). student_id is
-- UNIQUE and used by place_trade() to cross-check against team_members below.
create table investors (
  id uuid primary key default gen_random_uuid(),
  student_id text not null unique,
  name text not null,
  total_budget integer not null default 100000 check (total_budget >= 0)
);

-- transactions: single source of truth for money movement. investor_name is
-- intentionally dropped here (join investors.name instead of duplicating it).
create table transactions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  investor_id uuid not null references investors(id) on delete cascade,
  type text not null check (type in ('buy', 'sell')),
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index transactions_team_id_idx on transactions (team_id);
create index transactions_investor_id_idx on transactions (investor_id);

-- team_investment_totals: replaces the old Investment{teamId,amount} shape as a
-- computed aggregate instead of a redundant stored total.
create view team_investment_totals as
select
  t.id as team_id,
  coalesce(sum(case when tx.type = 'buy' then tx.amount else -tx.amount end), 0) as amount
from teams t
left join transactions tx on tx.team_id = t.id
group by t.id;

-- investor_budgets: an investor's remaining budget across all teams
create view investor_budgets as
select
  i.id as investor_id,
  i.total_budget
    - coalesce(sum(case when tx.type = 'buy' then tx.amount else -tx.amount end), 0)
    as remaining_budget
from investors i
left join transactions tx on tx.investor_id = i.id
group by i.id, i.total_budget;

-- investor_team_holdings: an investor's current position in one specific team
create view investor_team_holdings as
select
  investor_id,
  team_id,
  sum(case when type = 'buy' then amount else -amount end) as holding
from transactions
group by investor_id, team_id;

-- place_trade: validates budget/holding and blocks contest participants from
-- investing (cross-checked by student_id against participants + team_members),
-- atomically with the insert to close the client-trust gap in invest-in-team.
create or replace function place_trade(
  p_investor_id uuid, p_team_id uuid, p_type text, p_amount integer
) returns transactions
language plpgsql security definer set search_path = public as $$
declare
  v_investor_student_id text;
  v_remaining integer;
  v_holding integer;
  v_row transactions;
begin
  if p_type not in ('buy', 'sell') then
    raise exception 'invalid trade type';
  end if;
  if p_amount < 1000 then
    raise exception 'amount below minimum';
  end if;

  select student_id into v_investor_student_id from investors where id = p_investor_id;
  if v_investor_student_id is null then
    raise exception 'investor not found';
  end if;

  if exists (
    select 1 from participants p
    join team_members tm on tm.student_id = p.student_id
    where p.student_id = v_investor_student_id
  ) then
    raise exception '참가자는 투자할 수 없어요';
  end if;

  if p_type = 'buy' then
    select remaining_budget into v_remaining from investor_budgets where investor_id = p_investor_id;
    if v_remaining is null or p_amount > v_remaining then
      raise exception 'exceeds remaining budget';
    end if;
  else
    select holding into v_holding from investor_team_holdings
      where investor_id = p_investor_id and team_id = p_team_id;
    if v_holding is null or p_amount > v_holding then
      raise exception 'exceeds holding';
    end if;
  end if;

  insert into transactions (team_id, investor_id, type, amount)
    values (p_team_id, p_investor_id, p_type, p_amount)
    returning * into v_row;
  return v_row;
end;
$$;

alter table investors enable row level security;
alter table transactions enable row level security;

create policy "public read" on investors for select using (true);
create policy "public read" on transactions for select using (true);
