import { describe, expect, test } from "bun:test";
import { rubricCriteria } from "@/entities/rubric";
import type { JudgeEvaluation } from "./pure";
import { getEvaluationTotal } from "./pure";

function makeEvaluation(
  criteriaScores: Record<string, number>,
): JudgeEvaluation {
  return {
    judgeId: "judge-1",
    teamId: "team-1",
    criteriaScores,
    memo: "",
    submitted: true,
  };
}

describe("getEvaluationTotal", () => {
  test("returns 0 for a null or undefined evaluation", () => {
    expect(getEvaluationTotal(null)).toBe(0);
    expect(getEvaluationTotal(undefined)).toBe(0);
  });

  test("returns 0 when no criteria have been scored", () => {
    expect(getEvaluationTotal(makeEvaluation({}))).toBe(0);
  });

  test("returns 100 when every criterion is scored at its max", () => {
    const criteriaScores = Object.fromEntries(
      rubricCriteria.map((criterion) => [criterion.id, criterion.maxScore]),
    );
    expect(getEvaluationTotal(makeEvaluation(criteriaScores))).toBe(100);
  });

  test("rounds the raw score to the nearest percentage point", () => {
    // Score every criterion at exactly half of its own max — a realistic
    // per-criterion input, unlike dumping rubricMaxTotal/2 onto one
    // criterion (which would exceed that criterion's own maxScore).
    const criteriaScores = Object.fromEntries(
      rubricCriteria.map((criterion) => [criterion.id, criterion.maxScore / 2]),
    );
    expect(getEvaluationTotal(makeEvaluation(criteriaScores))).toBe(50);
  });

  test("ignores scores for criteria ids that aren't part of the rubric", () => {
    const criteriaScores = { "not-a-real-criterion": 999 };
    expect(getEvaluationTotal(makeEvaluation(criteriaScores))).toBe(0);
  });
});
