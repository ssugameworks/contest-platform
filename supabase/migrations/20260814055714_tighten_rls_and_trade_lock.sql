-- staff/participants/investors hold login ids or student ids (PII) — the
-- earlier "public read" policies let anyone with the anon key dump them
-- directly via the REST API. All real reads already go through Server
-- Actions using the service-role client, so these can be dropped outright.
drop policy "public read" on staff;
drop policy "public read" on participants;
drop policy "public read" on investors;

-- No INSERT/UPDATE/DELETE policies exist on any table by design — every
-- write goes through Server Actions using createAdminClient() (service
-- role, bypasses RLS). This isn't an oversight.

-- place_trade: close the race between reading remaining budget/holding and
-- inserting the transaction by serializing concurrent trades from the same
-- investor. Advisory lock is released automatically at transaction end.
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
  perform pg_advisory_xact_lock(hashtext(p_investor_id::text));

  if p_type not in ('buy', 'sell') then
    raise exception 'invalid trade type';
  end if;
  -- keep in sync with MIN_TRADE_AMOUNT in
  -- src/entities/investment/model/pure.ts (SQL can't import a JS constant)
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
