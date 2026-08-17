-- 매트릭스의 구역 목록/구역당 번호 개수는 관리자 화면의 "미리보기 폭"이 아니라
-- 실제 행사장 배치 설정이라 브라우저 로컬 상태가 아니라 DB에 있어야 해요.
-- investment_percent와 같은 싱글턴 설정 테이블(app_settings)에 얹어요.
alter table app_settings
  add column booth_zones text[] not null default '{}',
  add column booth_columns smallint not null default 20 check (booth_columns > 0);
