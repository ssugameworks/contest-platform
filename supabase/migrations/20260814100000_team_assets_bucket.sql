-- Public bucket for team logo/screenshot uploads. Public so <img src> can
-- load objects directly with no signed URL; all writes go through the
-- service-role client (uploadTeamImageAction), same as every other table in
-- this app — no storage.objects RLS policy needed for that.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'team-assets',
  'team-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;
