import { getTeamInvestmentTotals } from "@/entities/investment";
import { listTeams } from "@/entities/team";
import { throwIfError } from "@/shared/lib/supabase/query";
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
  const { data, error } = await supabase
    .from("judge_evaluations")
    .select("judge_id, team_id, criteria_scores, memo, submitted")
    .eq("judge_id", judgeId)
    .eq("team_id", teamId)
    .maybeSingle();
  throwIfError(error);
  return data ? mapEvaluation(data) : undefined;
}

// One query for every judge×team evaluation — for list views (judge's team
// list, admin score table) that otherwise fire one getEvaluation per cell.
// Unfiltered (includes drafts), unlike getJudgeScore/getJudgeScores which
// only want submitted ones for the average.
export async function listEvaluations(): Promise<JudgeEvaluation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("judge_evaluations")
    .select("judge_id, team_id, criteria_scores, memo, submitted");
  throwIfError(error);
  return (data ?? []).map(mapEvaluation);
}

// 잠정 합산 방식: 제출 완료된 심사위원 평가들의 단순 평균 (추후 바뀔 수 있음)
export async function getJudgeScore(teamId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("judge_evaluations")
    .select("judge_id, team_id, criteria_scores, memo, submitted")
    .eq("team_id", teamId)
    .eq("submitted", true);
  throwIfError(error);
  const submitted = (data ?? []).map(mapEvaluation);
  if (submitted.length === 0) return 0;
  const total = submitted.reduce(
    (sum, evaluation) => sum + getEvaluationTotal(evaluation),
    0,
  );
  return Math.round(total / submitted.length);
}

// One query for every team's judge average, for the leaderboard (which
// otherwise calls getJudgeScore per team, each hitting judge_evaluations).
export async function getJudgeScores(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("judge_evaluations")
    .select("judge_id, team_id, criteria_scores, memo, submitted")
    .eq("submitted", true);
  throwIfError(error);
  const byTeam = new Map<string, JudgeEvaluation[]>();
  for (const row of data ?? []) {
    const evaluation = mapEvaluation(row);
    const list = byTeam.get(evaluation.teamId) ?? [];
    list.push(evaluation);
    byTeam.set(evaluation.teamId, list);
  }
  return Object.fromEntries(
    [...byTeam].map(([teamId, evaluations]) => {
      const total = evaluations.reduce(
        (sum, evaluation) => sum + getEvaluationTotal(evaluation),
        0,
      );
      return [teamId, Math.round(total / evaluations.length)];
    }),
  );
}

export async function getInvestmentWeight(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("investment_percent")
    .eq("id", true)
    .maybeSingle();
  throwIfError(error);
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

// Fetches totals/weight/judge scores once (not once per team, unlike
// looping getInvestmentScore/getJudgeScore/getFinalScore per team) and
// computes every team's entry from that in memory.
export async function getScoreLeaderboard(): Promise<ScoreLeaderboardEntry[]> {
  const [teams, totals, investmentPercent, judgeScores] = await Promise.all([
    listTeams(),
    getTeamInvestmentTotals(),
    getInvestmentWeight(),
    getJudgeScores(),
  ]);
  const investmentWeight = investmentPercent / 100;
  const judgeWeight = 1 - investmentWeight;
  const maxAmount = Math.max(0, ...totals.map((entry) => entry.amount));
  const amountByTeam = Object.fromEntries(
    totals.map((entry) => [entry.teamId, entry.amount]),
  );

  const entries = teams.map((team) => {
    const amount = amountByTeam[team.id] ?? 0;
    const investmentScore =
      maxAmount > 0 ? Math.round((amount / maxAmount) * 100) : 0;
    const judgeScore = judgeScores[team.id] ?? 0;
    const finalScore = Math.round(
      investmentScore * investmentWeight + judgeScore * judgeWeight,
    );
    return { teamId: team.id, investmentScore, judgeScore, finalScore };
  });
  return entries.sort((a, b) => b.finalScore - a.finalScore);
}
