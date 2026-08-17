// No supabase imports here — client components import this file directly
// (not via ./index.ts) so they don't pull in the server-only Supabase client.
export interface Booth {
  id: string;
  teamId: string | null;
  zone: string;
  number: number;
  blocked: boolean;
}

export function formatBoothLocation(
  booth: Pick<Booth, "zone" | "number">,
): string {
  return `${booth.zone}-${booth.number}`;
}

// 관리자가 매트릭스에서 편집하는 캔버스 크기(구역 목록/구역당 번호 개수).
// 실제 부스(슬롯) 데이터와 별개로, 행사장 배치 자체의 설정값이라 DB에 저장돼요.
export interface BoothMatrixConfig {
  zones: string[];
  columns: number;
}

// 팀이 아니라 시설을 나타내는 그리드 마커(안내데스크/포토존 등).
// 부스와 좌표를 공유하되 팀 배정 개념이 없어 별도 타입으로 둬요.
export const BOOTH_MARKER_KINDS = [
  "info",
  "photo",
  "stairs",
  "elevator",
  "sponsor",
  "direction",
  "restroom",
  "scoreboard",
  "door",
] as const;
export type BoothMarkerKind = (typeof BOOTH_MARKER_KINDS)[number];

export interface BoothMarker {
  zone: string;
  number: number;
  kind: BoothMarkerKind;
}
