"use server";

import { createAdminClient } from "@/shared/lib/supabase/admin";
import {
  getInvestmentWeight,
  getScoreLeaderboard,
  type JudgeEvaluation,
  listEvaluations,
  type ScoreLeaderboardEntry,
} from "./score";

export async function getScoreLeaderboardAction(): Promise<
  ScoreLeaderboardEntry[]
> {
  return getScoreLeaderboard();
}

export async function listEvaluationsAction(): Promise<JudgeEvaluation[]> {
  return listEvaluations();
}

export async function getInvestmentWeightAction(): Promise<number> {
  return getInvestmentWeight();
}

export async function setInvestmentWeightAction(
  percent: number,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ investment_percent: percent })
    .eq("id", true);
  if (error) throw new Error(error.message);
}
