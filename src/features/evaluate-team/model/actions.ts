"use server";

import { getEvaluation, type JudgeEvaluation } from "@/entities/score";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export async function getEvaluationAction(
  judgeId: string,
  teamId: string,
): Promise<JudgeEvaluation | null> {
  // react-query's queryFn can't resolve to undefined, so coalesce here rather
  // than at every call site.
  return (await getEvaluation(judgeId, teamId)) ?? null;
}

export async function submitEvaluationAction(
  judgeId: string,
  teamId: string,
  patch: {
    criteriaScores: Record<string, number>;
    memo: string;
  },
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("judge_evaluations").upsert(
    {
      judge_id: judgeId,
      team_id: teamId,
      criteria_scores: patch.criteriaScores,
      memo: patch.memo,
      submitted: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "judge_id,team_id" },
  );
  if (error) throw new Error(error.message);
}
