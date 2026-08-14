-- password_hash starts null: participants are seeded without one and existing
-- investors predate this feature. First login with a null hash registers the
-- submitted password instead of rejecting it.
alter table participants add column password_hash text;
alter table investors add column password_hash text;
