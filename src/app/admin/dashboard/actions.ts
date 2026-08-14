"use server";

import {
  getInvestorCount,
  getTeamInvestmentTotals,
} from "@/entities/investment";
import { listInvestors } from "@/entities/investor";
import { getScoreLeaderboard } from "@/entities/score";
import { listTeams } from "@/entities/team";

export async function getDashboardStats() {
  const [totals, teams, investors, scoreLeaderboard] = await Promise.all([
    getTeamInvestmentTotals(),
    listTeams(),
    listInvestors(),
    getScoreLeaderboard(),
  ]);

  const investorCounts = Object.fromEntries(
    await Promise.all(
      teams.map(
        async (team) => [team.id, await getInvestorCount(team.id)] as const,
      ),
    ),
  );

  return {
    totals,
    teams,
    investorsCount: investors.length,
    scoreLeaderboard,
    investorCounts,
  };
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;
