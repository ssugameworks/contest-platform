// No supabase imports here — client components import this file directly
// (not via ./index.ts) so they don't pull in the server-only Supabase client.
import { rubricCriteria, rubricMaxTotal } from "@/entities/rubric";

export interface JudgeEvaluation {
  judgeId: string;
  teamId: string;
  criteriaScores: Record<string, number>;
  memo: string;
  submitted: boolean;
}

export interface ScoreLeaderboardEntry {
  teamId: string;
  investmentScore: number;
  judgeScore: number;
  finalScore: number;
}

export function getEvaluationTotal(
  evaluation: JudgeEvaluation | null | undefined,
): number {
  if (!evaluation) return 0;
  const raw = rubricCriteria.reduce(
    (sum, criterion) => sum + (evaluation.criteriaScores[criterion.id] ?? 0),
    0,
  );
  return rubricMaxTotal > 0 ? Math.round((raw / rubricMaxTotal) * 100) : 0;
}
