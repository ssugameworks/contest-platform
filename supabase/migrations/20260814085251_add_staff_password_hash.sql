-- Same pattern as participants/investors: staff (admin/judge1/judge2) are
-- seeded without a password, so it starts null and gets registered on first
-- login instead of being pre-assigned.
alter table staff add column password_hash text;
