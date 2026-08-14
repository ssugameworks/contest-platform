import { mockLeaderboard } from "@/entities/investment";
import { rubricCriteria, rubricMaxTotal } from "@/entities/rubric";
import { mockTeams } from "@/entities/team";

export interface JudgeEvaluation {
  judgeId: string;
  teamId: string;
  criteriaScores: Record<string, number>;
  memo: string;
  submitted: boolean;
}

export const mockJudgeEvaluations: JudgeEvaluation[] = [
  {
    judgeId: "judge1",
    teamId: "team-1",
    criteriaScores: { problem: 8, tech: 7, feasibility: 8, presentation: 9 },
    memo: "발표가 인상적이었어요. 기술 구현 디테일을 더 보고 싶어요.",
    submitted: true,
  },
  {
    judgeId: "judge2",
    teamId: "team-1",
    criteriaScores: { problem: 9, tech: 8, feasibility: 7, presentation: 8 },
    memo: "문제 정의가 명확함.",
    submitted: true,
  },
];

const INITIAL_JUDGE_EVALUATIONS: JudgeEvaluation[] =
  structuredClone(mockJudgeEvaluations);

export const scoreWeights = { investmentPercent: 50 };

const INITIAL_INVESTMENT_PERCENT = scoreWeights.investmentPercent;

export function getInvestmentScore(teamId: string): number {
  const max = Math.max(...mockLeaderboard.map((entry) => entry.amount));
  const amount =
    mockLeaderboard.find((entry) => entry.teamId === teamId)?.amount ?? 0;
  return max > 0 ? Math.round((amount / max) * 100) : 0;
}

export function getEvaluation(
  judgeId: string,
  teamId: string,
): JudgeEvaluation | undefined {
  return mockJudgeEvaluations.find(
    (evaluation) =>
      evaluation.judgeId === judgeId && evaluation.teamId === teamId,
  );
}

export function upsertEvaluation(
  judgeId: string,
  teamId: string,
  patch: Partial<Omit<JudgeEvaluation, "judgeId" | "teamId">>,
): void {
  const existing = getEvaluation(judgeId, teamId);
  if (existing) {
    Object.assign(existing, patch);
  } else {
    mockJudgeEvaluations.push({
      judgeId,
      teamId,
      criteriaScores: {},
      memo: "",
      submitted: false,
      ...patch,
    });
  }
}

export function getEvaluationTotal(
  evaluation: JudgeEvaluation | undefined,
): number {
  if (!evaluation) return 0;
  const raw = rubricCriteria.reduce(
    (sum, criterion) => sum + (evaluation.criteriaScores[criterion.id] ?? 0),
    0,
  );
  return rubricMaxTotal > 0 ? Math.round((raw / rubricMaxTotal) * 100) : 0;
}

// 잠정 합산 방식: 제출 완료된 심사위원 평가들의 단순 평균 (추후 바뀔 수 있음)
export function getJudgeScore(teamId: string): number {
  const submitted = mockJudgeEvaluations.filter(
    (evaluation) => evaluation.teamId === teamId && evaluation.submitted,
  );
  if (submitted.length === 0) return 0;
  const total = submitted.reduce(
    (sum, evaluation) => sum + getEvaluationTotal(evaluation),
    0,
  );
  return Math.round(total / submitted.length);
}

export function setInvestmentWeight(investmentPercent: number): void {
  scoreWeights.investmentPercent = investmentPercent;
}

export function getFinalScore(teamId: string): number {
  const investmentWeight = scoreWeights.investmentPercent / 100;
  const judgeWeight = 1 - investmentWeight;
  return Math.round(
    getInvestmentScore(teamId) * investmentWeight +
      getJudgeScore(teamId) * judgeWeight,
  );
}

export interface ScoreLeaderboardEntry {
  teamId: string;
  investmentScore: number;
  judgeScore: number;
  finalScore: number;
}

export function getScoreLeaderboard(): ScoreLeaderboardEntry[] {
  return mockTeams
    .map((team) => ({
      teamId: team.id,
      investmentScore: getInvestmentScore(team.id),
      judgeScore: getJudgeScore(team.id),
      finalScore: getFinalScore(team.id),
    }))
    .sort((a, b) => b.finalScore - a.finalScore);
}

export function resetScores(): void {
  mockJudgeEvaluations.length = 0;
  mockJudgeEvaluations.push(...structuredClone(INITIAL_JUDGE_EVALUATIONS));
  scoreWeights.investmentPercent = INITIAL_INVESTMENT_PERCENT;
}
