-- Only tables with an existing public-read RLS policy are added — the
-- anon-key browser client used for Realtime can only receive change events
-- for rows it's already allowed to SELECT (investors/participants/staff stay
-- excluded, same as their dropped "public read" policy).
alter publication supabase_realtime add table teams, transactions, judge_evaluations, app_settings;
