"use server";

import {
  getInvestorCounts,
  getTeamInvestmentTotals,
} from "@/entities/investment";
import { listInvestors } from "@/entities/investor";
import { getScoreLeaderboard } from "@/entities/score";
import { requireAdmin } from "@/entities/staff/model/session";
import { listTeams } from "@/entities/team";

export async function getDashboardStats() {
  await requireAdmin();
  const [totals, teams, investors, scoreLeaderboard, investorCounts] =
    await Promise.all([
      getTeamInvestmentTotals(),
      listTeams(),
      listInvestors(),
      getScoreLeaderboard(),
      getInvestorCounts(),
    ]);

  return {
    totals,
    teams,
    investorsCount: investors.length,
    scoreLeaderboard,
    investorCounts,
  };
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;
