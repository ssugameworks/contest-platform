-- 5MiB was too small for real product screenshots (desktop screenshots in
-- particular routinely exceed it as lossless PNG) and uploads were failing
-- with a silent 413 EntityTooLarge. Raise to 15MiB.
update storage.buckets
set file_size_limit = 15728640
where id = 'team-assets';
