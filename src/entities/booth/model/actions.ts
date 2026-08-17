"use server";

import { requireAdmin } from "@/entities/staff/model/session";
import {
  type Booth,
  type BoothMatrixConfig,
  getBoothByTeamId,
  getBoothMatrixConfig,
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

export async function getBoothMatrixConfigAction(): Promise<BoothMatrixConfig> {
  await requireAdmin();
  return getBoothMatrixConfig();
}
