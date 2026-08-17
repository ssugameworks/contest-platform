-- NxN 매트릭스 안에는 실제로 부스를 놓을 수 없는 자리(기둥/통로 등)가 있을
-- 수 있어요. 그런 자리는 행을 아예 안 만드는 것과 구분해서 명시적으로
-- "막힌 자리"로 표시할 수 있어야, 관리자 화면에서도 실수로 빈 자리처럼
-- 보이지 않고, 일반 사용자에게는 완전히 안 보이게(필터링) 처리할 수 있어요.
alter table booths add column blocked boolean not null default false;
