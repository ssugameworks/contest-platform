"use server";

import {
  type Booth,
  type BoothMarker,
  type BoothMatrixConfig,
  getBoothByTeamId,
  getBoothMatrixConfig,
  listBoothMarkers,
  listBooths,
} from "./booth";

export async function getBoothByTeamIdAction(
  teamId: string,
): Promise<Booth | null> {
  return getBoothByTeamId(teamId);
}

export async function listBoothsAction(): Promise<Booth[]> {
  return listBooths();
}

export async function listBoothMarkersAction(): Promise<BoothMarker[]> {
  return listBoothMarkers();
}

// 팀 배치도(BoothFloorPlan)는 참가자·투자자·심사위원 등 누구나 볼 수 있는
// 화면에서 열려요 — zones/columns는 민감한 값이 아니라 다른 읽기 전용
// 부스 액션들처럼 인증 없이 내려줘요. 편집(setBoothMatrixConfigAction)만
// admin으로 막아두면 충분해요.
export async function getBoothMatrixConfigAction(): Promise<BoothMatrixConfig> {
  return getBoothMatrixConfig();
}
