-- Settled on 10MiB (matches the app's MAX_IMAGE_BYTES check) instead of the
-- 15MiB from the previous migration.
update storage.buckets
set file_size_limit = 10485760
where id = 'team-assets';
