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
