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

export interface BoothMatrixCell {
  zone: string;
  number: number;
  booth?: Booth;
  marker?: BoothMarker;
}

/**
 * 부스/마커를 구역(행) × 번호(열) 매트릭스로 배열해요. 저장된 matrixConfig가
 * 없거나 실제 데이터가 그보다 크면(예: 설정 전에 만들어진 부스) 실제 데이터
 * 범위까지 자동으로 넓혀서, 어떤 화면에서 봐도 항상 같은 격자가 나오게 해요.
 * 빈 칸(부스도 마커도 없는 통로)은 렌더러가 투명 셀로 자리만 유지하면 돼요.
 */
export function buildBoothMatrix(
  booths: Booth[],
  markers: BoothMarker[],
  matrixConfig?: BoothMatrixConfig,
): { zones: string[]; columns: number; grid: BoothMatrixCell[][] } {
  const visibleBooths = booths.filter((booth) => !booth.blocked);

  const zones = [
    ...new Set([
      ...(matrixConfig?.zones ?? []),
      ...visibleBooths.map((booth) => booth.zone),
      ...markers.map((marker) => marker.zone),
    ]),
  ].sort();

  const maxNumber = Math.max(
    0,
    ...visibleBooths.map((booth) => booth.number),
    ...markers.map((marker) => marker.number),
  );
  const columns = Math.max(matrixConfig?.columns ?? 0, maxNumber, 1);

  const grid = zones.map((zone) =>
    Array.from({ length: columns }, (_, i) => {
      const number = i + 1;
      return {
        zone,
        number,
        booth: visibleBooths.find(
          (booth) => booth.zone === zone && booth.number === number,
        ),
        marker: markers.find(
          (marker) => marker.zone === zone && marker.number === number,
        ),
      };
    }),
  );

  return { zones, columns, grid };
}
