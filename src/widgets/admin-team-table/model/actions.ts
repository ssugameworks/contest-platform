"use server";

import { formatBoothLocation, getBoothByTeamId } from "@/entities/booth";
import {
  getInvestmentRank,
  getInvestorCount,
  getTeamInvestmentTotal,
} from "@/entities/investment";
import { listTeams, type Team } from "@/entities/team";

export interface AdminTeamRow {
  team: Team;
  amount: number;
  investorCount: number;
  rank: number;
  boothLabel: string;
}

export async function listAdminTeamRows(): Promise<AdminTeamRow[]> {
  const teams = await listTeams();
  return Promise.all(
    teams.map(async (team) => {
      const [amount, investorCount, { rank }, booth] = await Promise.all([
        getTeamInvestmentTotal(team.id),
        getInvestorCount(team.id),
        getInvestmentRank(team.id),
        getBoothByTeamId(team.id),
      ]);
      return {
        team,
        amount,
        investorCount,
        rank,
        boothLabel: booth ? formatBoothLocation(booth) : "-",
      };
    }),
  );
}
