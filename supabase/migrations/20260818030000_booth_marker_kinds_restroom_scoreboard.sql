-- 화장실/스코어보드 마커 종류 추가.
alter table booth_markers drop constraint booth_markers_kind_check;
alter table booth_markers add constraint booth_markers_kind_check check (
  kind in (
    'info', 'photo', 'stairs', 'elevator', 'sponsor', 'direction',
    'restroom', 'scoreboard'
  )
);
