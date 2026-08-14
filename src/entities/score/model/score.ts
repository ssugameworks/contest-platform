import { getTeamInvestmentTotals } from "@/entities/investment";
import { listTeams } from "@/entities/team";
import { createClient } from "@/shared/lib/supabase/server";
import {
  getEvaluationTotal,
  type JudgeEvaluation,
  type ScoreLeaderboardEntry,
} from "./pure";

export type { JudgeEvaluation, ScoreLeaderboardEntry } from "./pure";
export { getEvaluationTotal } from "./pure";

function mapEvaluation(row: {
  judge_id: string;
  team_id: string;
  criteria_scores: unknown;
  memo: string;
  submitted: boolean;
}): JudgeEvaluation {
  return {
    judgeId: row.judge_id,
    teamId: row.team_id,
    criteriaScores: (row.criteria_scores as Record<string, number>) ?? {},
    memo: row.memo,
    submitted: row.submitted,
  };
}

export async function getInvestmentScore(teamId: string): Promise<number> {
  const totals = await getTeamInvestmentTotals();
  const max = Math.max(0, ...totals.map((entry) => entry.amount));
  const amount = totals.find((entry) => entry.teamId === teamId)?.amount ?? 0;
  return max > 0 ? Math.round((amount / max) * 100) : 0;
}

export async function getEvaluation(
  judgeId: string,
  teamId: string,
): Promise<JudgeEvaluation | undefined> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("judge_evaluations")
    .select("judge_id, team_id, criteria_scores, memo, submitted")
    .eq("judge_id", judgeId)
    .eq("team_id", teamId)
    .maybeSingle();
  return data ? mapEvaluation(data) : undefined;
}

// 잠정 합산 방식: 제출 완료된 심사위원 평가들의 단순 평균 (추후 바뀔 수 있음)
export async function getJudgeScore(teamId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("judge_evaluations")
    .select("judge_id, team_id, criteria_scores, memo, submitted")
    .eq("team_id", teamId)
    .eq("submitted", true);
  const submitted = (data ?? []).map(mapEvaluation);
  if (submitted.length === 0) return 0;
  const total = submitted.reduce(
    (sum, evaluation) => sum + getEvaluationTotal(evaluation),
    0,
  );
  return Math.round(total / submitted.length);
}

export async function getInvestmentWeight(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("investment_percent")
    .eq("id", true)
    .single();
  return data?.investment_percent ?? 50;
}

export async function getFinalScore(teamId: string): Promise<number> {
  const [investmentScore, judgeScore, investmentPercent] = await Promise.all([
    getInvestmentScore(teamId),
    getJudgeScore(teamId),
    getInvestmentWeight(),
  ]);
  const investmentWeight = investmentPercent / 100;
  const judgeWeight = 1 - investmentWeight;
  return Math.round(
    investmentScore * investmentWeight + judgeScore * judgeWeight,
  );
}

export async function getScoreLeaderboard(): Promise<ScoreLeaderboardEntry[]> {
  const teams = await listTeams();
  const entries = await Promise.all(
    teams.map(async (team) => {
      const [investmentScore, judgeScore, finalScore] = await Promise.all([
        getInvestmentScore(team.id),
        getJudgeScore(team.id),
        getFinalScore(team.id),
      ]);
      return { teamId: team.id, investmentScore, judgeScore, finalScore };
    }),
  );
  return entries.sort((a, b) => b.finalScore - a.finalScore);
}
