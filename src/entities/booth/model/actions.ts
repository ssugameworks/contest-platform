"use server";

import { requireAdmin } from "@/entities/staff/model/session";
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

export async function getBoothMatrixConfigAction(): Promise<BoothMatrixConfig> {
  await requireAdmin();
  return getBoothMatrixConfig();
}
