-- 그리드에 안내데스크/포토존/계단 같은, 팀이 아니라 시설을 나타내는
-- 마커를 놓기 위한 테이블. booths와 좌표(zone, number)를 공유하지만
-- 팀 배정/차단 개념이 없어 별도 테이블로 둔다. 한 좌표엔 마커가 하나뿐이라
-- (zone, number)가 그대로 기본키.
create table booth_markers (
  zone text not null,
  number smallint not null,
  kind text not null check (
    kind in ('info', 'photo', 'stairs', 'elevator', 'sponsor', 'direction')
  ),
  primary key (zone, number)
);

alter table booth_markers enable row level security;
create policy "public read" on booth_markers for select using (true);
