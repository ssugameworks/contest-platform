import { describe, expect, mock, test } from "bun:test";
import { rubricCriteria } from "@/entities/rubric";

// score.ts calls out to two other entities and a live Supabase client —
// none of that is available (or desirable) in a unit test, so every
// dependency it reaches for is faked at the module boundary. The fake
// Supabase client below only implements the exact chain shapes score.ts
// happens to call (.select().eq()... and .select().eq().maybeSingle()),
// pre-filtered as if the real query had already run.
function fakeQueryResult(data: unknown, error: null = null) {
  const result = { data, error };
  const builder: PromiseLike<typeof result> & {
    select: () => typeof builder;
    eq: () => typeof builder;
    order: () => typeof builder;
    maybeSingle: () => Promise<typeof result>;
  } = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    maybeSingle: async () => result,
    // Mirrors supabase-js's PostgrestBuilder, which score.ts awaits directly
    // without calling .maybeSingle()/.single() first.
    // biome-ignore lint/suspicious/noThenProperty: intentionally thenable
    then: (onFulfilled, onRejected) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return builder;
}

function fakeSupabaseClient(fixtures: Record<string, unknown>) {
  return {
    from(table: string) {
      return fakeQueryResult(fixtures[table] ?? null);
    },
  };
}

function fullMarksEvaluationRow(judgeId: string, teamId: string) {
  return {
    judge_id: judgeId,
    team_id: teamId,
    criteria_scores: Object.fromEntries(
      rubricCriteria.map((criterion) => [criterion.id, criterion.maxScore]),
    ),
    memo: "",
    submitted: true,
  };
}

describe("score.ts (Supabase and sibling-entity calls mocked)", () => {
  test("getInvestmentScore scales a team's amount against the highest bidder", async () => {
    mock.module("@/entities/investment", () => ({
      getTeamInvestmentTotals: async () => [
        { teamId: "team-a", amount: 100 },
        { teamId: "team-b", amount: 50 },
      ],
    }));
    const { getInvestmentScore } = await import("./score");

    expect(await getInvestmentScore("team-a")).toBe(100);
    expect(await getInvestmentScore("team-b")).toBe(50);
    expect(await getInvestmentScore("team-unknown")).toBe(0);
  });

  test("getInvestmentScore returns 0 for every team when nothing has been invested", async () => {
    mock.module("@/entities/investment", () => ({
      getTeamInvestmentTotals: async () => [],
    }));
    const { getInvestmentScore } = await import("./score");

    expect(await getInvestmentScore("team-a")).toBe(0);
  });

  test("getScoreLeaderboard blends investment and judge scores by the configured weight, sorted by final score desc", async () => {
    mock.module("@/entities/team", () => ({
      listTeams: async () => [
        { id: "team-a", name: "A" },
        { id: "team-b", name: "B" },
      ],
    }));
    mock.module("@/entities/investment", () => ({
      getTeamInvestmentTotals: async () => [
        { teamId: "team-a", amount: 100 },
        { teamId: "team-b", amount: 50 },
      ],
    }));
    mock.module("@/shared/lib/supabase/server", () => ({
      createClient: async () =>
        fakeSupabaseClient({
          // Only team-a has a submitted evaluation; team-b gets no rows
          // back, matching what the real .eq("submitted", true) filter
          // would return.
          judge_evaluations: [fullMarksEvaluationRow("judge-1", "team-a")],
          app_settings: { investment_percent: 60 },
        }),
    }));
    const { getScoreLeaderboard } = await import("./score");

    const leaderboard = await getScoreLeaderboard();

    // team-a: investmentScore 100, judgeScore 100 -> 100*0.6 + 100*0.4 = 100
    // team-b: investmentScore 50, judgeScore 0 (no evaluation) -> 50*0.6 = 30
    expect(leaderboard).toEqual([
      {
        teamId: "team-a",
        investmentScore: 100,
        judgeScore: 100,
        finalScore: 100,
      },
      { teamId: "team-b", investmentScore: 50, judgeScore: 0, finalScore: 30 },
    ]);
  });

  test("getScoreLeaderboard falls back to a 50/50 weight when app_settings has no row", async () => {
    mock.module("@/entities/team", () => ({
      listTeams: async () => [{ id: "team-a", name: "A" }],
    }));
    mock.module("@/entities/investment", () => ({
      getTeamInvestmentTotals: async () => [{ teamId: "team-a", amount: 10 }],
    }));
    mock.module("@/shared/lib/supabase/server", () => ({
      createClient: async () =>
        fakeSupabaseClient({
          judge_evaluations: [],
          app_settings: null,
        }),
    }));
    const { getScoreLeaderboard } = await import("./score");

    const [entry] = await getScoreLeaderboard();

    // investmentScore 100 (sole/highest bidder), judgeScore 0 -> 100*0.5 + 0*0.5 = 50
    expect(entry?.finalScore).toBe(50);
  });
});
