"use server";

import { formatBoothLocation, listBooths } from "@/entities/booth";
import {
  getInvestorCounts,
  getTeamInvestmentTotals,
} from "@/entities/investment";
import { listTeams, type Team } from "@/entities/team";

export interface AdminTeamRow {
  team: Team;
  amount: number;
  investorCount: number;
  boothLabel: string;
}

// One query per aggregate (not per team) — teams.length no longer
// multiplies the number of round trips to Supabase.
export async function listAdminTeamRows(): Promise<AdminTeamRow[]> {
  const [teams, totals, investorCounts, booths] = await Promise.all([
    listTeams(),
    getTeamInvestmentTotals(),
    getInvestorCounts(),
    listBooths(),
  ]);
  const amountByTeam = Object.fromEntries(
    totals.map((entry) => [entry.teamId, entry.amount]),
  );
  const boothByTeam = Object.fromEntries(
    booths.map((booth) => [booth.teamId, booth]),
  );

  return teams.map((team) => {
    const booth = boothByTeam[team.id];
    return {
      team,
      amount: amountByTeam[team.id] ?? 0,
      investorCount: investorCounts[team.id] ?? 0,
      boothLabel: booth ? formatBoothLocation(booth) : "-",
    };
  });
}
