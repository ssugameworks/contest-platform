"use server";

import { type Booth, getBoothByTeamId } from "./booth";

export async function getBoothByTeamIdAction(
  teamId: string,
): Promise<Booth | null> {
  return getBoothByTeamId(teamId);
}
