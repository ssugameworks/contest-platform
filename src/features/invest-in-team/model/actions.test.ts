import { describe, expect, mock, test } from "bun:test";

// actions.ts unconditionally imports "@/shared/lib/supabase/admin" at the
// top of the file (which itself imports "server-only"), so every test needs
// it stubbed just to load the module — even the getTradeContextAction tests
// that never call the RPC it provides.
function stubAdminClient(
  rpc: (...args: unknown[]) => unknown = async () => ({
    error: null,
  }),
) {
  mock.module("@/shared/lib/supabase/admin", () => ({
    createAdminClient: () => ({ rpc }),
  }));
}

// actions.ts reaches into two other entities and (for placeTradeAction) a
// live Supabase RPC — all faked at the module boundary so these tests only
// exercise this file's own guard clauses and argument wiring.
describe("invest-in-team actions (Supabase and sibling-entity calls mocked)", () => {
  test("getTradeContextAction returns null when nobody is logged in as an investor", async () => {
    stubAdminClient();
    mock.module("@/entities/investor", () => ({
      getCurrentInvestor: async () => null,
      getInvestorBudget: async () => 0,
    }));
    mock.module("@/entities/investment", () => ({
      getInvestorHolding: async () => 0,
    }));
    const { getTradeContextAction } = await import("./actions");

    expect(await getTradeContextAction("team-1")).toBeNull();
  });

  test("getTradeContextAction returns the investor's budget and holding for the team", async () => {
    stubAdminClient();
    mock.module("@/entities/investor", () => ({
      getCurrentInvestor: async () => ({
        id: "investor-1",
        name: "김투자",
        studentId: "20240001",
        totalBudget: 100000,
      }),
      getInvestorBudget: async () => 42000,
    }));
    mock.module("@/entities/investment", () => ({
      getInvestorHolding: async () => 5000,
    }));
    const { getTradeContextAction } = await import("./actions");

    expect(await getTradeContextAction("team-1")).toEqual({
      investorId: "investor-1",
      investorName: "김투자",
      remainingBudget: 42000,
      holding: 5000,
    });
  });

  test("placeTradeAction rejects when nobody is logged in as an investor", async () => {
    stubAdminClient();
    mock.module("@/entities/investor", () => ({
      getCurrentInvestor: async () => null,
    }));
    const { placeTradeAction } = await import("./actions");

    await expect(placeTradeAction("team-1", "buy", 1000)).rejects.toThrow(
      "투자자로 로그인해주세요",
    );
  });

  test("placeTradeAction forwards the trade to the place_trade RPC with the logged-in investor's id", async () => {
    const rpc = mock(async () => ({ error: null }));
    mock.module("@/entities/investor", () => ({
      getCurrentInvestor: async () => ({ id: "investor-1", name: "김투자" }),
    }));
    mock.module("@/shared/lib/supabase/admin", () => ({
      createAdminClient: () => ({ rpc }),
    }));
    const { placeTradeAction } = await import("./actions");

    await placeTradeAction("team-1", "buy", 5000);

    expect(rpc).toHaveBeenCalledWith("place_trade", {
      p_investor_id: "investor-1",
      p_team_id: "team-1",
      p_type: "buy",
      p_amount: 5000,
    });
  });

  test("placeTradeAction surfaces the RPC's error message (e.g. the DB's < MIN_TRADE_AMOUNT check)", async () => {
    mock.module("@/entities/investor", () => ({
      getCurrentInvestor: async () => ({ id: "investor-1", name: "김투자" }),
    }));
    mock.module("@/shared/lib/supabase/admin", () => ({
      createAdminClient: () => ({
        rpc: async () => ({ error: { message: "거래 금액이 너무 작아요" } }),
      }),
    }));
    const { placeTradeAction } = await import("./actions");

    await expect(placeTradeAction("team-1", "buy", 100)).rejects.toThrow(
      "거래 금액이 너무 작아요",
    );
  });
});
