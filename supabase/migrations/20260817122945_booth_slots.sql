-- 부스를 팀과 1:1로 묶어두면 "빈 자리"라는 개념 자체가 없어서 매트릭스를
-- 만들 수 없다. team_id를 nullable FK로 바꾸고 새 id를 PK로 세운다.
alter table booths add column id uuid not null default gen_random_uuid();
alter table booths drop constraint booths_pkey;
alter table booths add constraint booths_pkey primary key (id);
alter table booths alter column team_id drop not null;
alter table booths add constraint booths_zone_number_key unique (zone, number);
create unique index booths_team_id_key on booths (team_id) where team_id is not null;
