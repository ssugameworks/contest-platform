"use server";

import { getTeamById, listTeams, type Team } from "./team";

export async function getTeamByIdAction(id: string): Promise<Team | null> {
  return getTeamById(id);
}

export async function listTeamsAction(): Promise<Team[]> {
  return listTeams();
}
