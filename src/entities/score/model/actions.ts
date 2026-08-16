"use server";

import { requireAdmin, requireStaff } from "@/entities/staff/model/session";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import {
  getInvestmentWeight,
  getScoreLeaderboard,
  type JudgeEvaluation,
  listEvaluations,
  type ScoreLeaderboardEntry,
} from "./score";

// Public — the /leaderboard page reads this without a session, and
// judge_evaluations/transactions/teams/app_settings all already have public
// read RLS policies, so nothing new is exposed here.
export async function getScoreLeaderboardAction(): Promise<
  ScoreLeaderboardEntry[]
> {
  return getScoreLeaderboard();
}

export async function listEvaluationsAction(): Promise<JudgeEvaluation[]> {
  await requireStaff();
  return listEvaluations();
}

export async function getInvestmentWeightAction(): Promise<number> {
  await requireAdmin();
  return getInvestmentWeight();
}

export async function setInvestmentWeightAction(
  percent: number,
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ investment_percent: percent })
    .eq("id", true);
  if (error) throw new Error(error.message);
}
