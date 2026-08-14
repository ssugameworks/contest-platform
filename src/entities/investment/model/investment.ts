import { createAdminClient } from "@/shared/lib/supabase/admin";
import { throwIfError } from "@/shared/lib/supabase/query";
import {
  type Investment,
  maskInvestorName,
  type Transaction,
  type TransactionType,
} from "./pure";

export type { Investment, Transaction, TransactionType } from "./pure";
export { maskInvestorName } from "./pure";

export async function getTeamInvestmentTotals(): Promise<Investment[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("team_investment_totals")
    .select("team_id, amount");
  throwIfError(error);
  return (data ?? []).map((row) => ({
    teamId: row.team_id as string,
    amount: row.amount ?? 0,
  }));
}

export async function getTeamInvestmentTotal(teamId: string): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("team_investment_totals")
    .select("amount")
    .eq("team_id", teamId)
    .maybeSingle();
  throwIfError(error);
  return data?.amount ?? 0;
}

export async function getInvestmentRank(
  teamId: string,
): Promise<{ rank: number; totalTeams: number }> {
  const totals = await getTeamInvestmentTotals();
  const sorted = [...totals].sort((a, b) => b.amount - a.amount);
  return {
    rank: sorted.findIndex((entry) => entry.teamId === teamId) + 1,
    totalTeams: sorted.length,
  };
}

// anonymize masks the investor name server-side (for public-facing views)
// so the real name never reaches the client bundle in the first place.
export async function getTransactions(
  teamId: string,
  { anonymize = false }: { anonymize?: boolean } = {},
): Promise<Transaction[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("id, team_id, investor_id, type, amount, investors(name)")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });
  throwIfError(error);
  return (data ?? []).map((tx) => {
    const name = tx.investors?.name ?? "";
    return {
      id: tx.id,
      teamId: tx.team_id,
      investorId: tx.investor_id,
      investorName: anonymize ? maskInvestorName(name) : name,
      type: tx.type as TransactionType,
      amount: tx.amount,
    };
  });
}

export async function getInvestorCount(teamId: string): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("investor_id")
    .eq("team_id", teamId);
  throwIfError(error);
  return new Set((data ?? []).map((row) => row.investor_id)).size;
}

// One query for every team's investor count, for callers (admin tables/
// dashboard) that need all of them instead of looping getInvestorCount.
export async function getInvestorCounts(): Promise<Record<string, number>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("team_id, investor_id");
  throwIfError(error);
  const byTeam = new Map<string, Set<string>>();
  for (const row of data ?? []) {
    const investors = byTeam.get(row.team_id) ?? new Set<string>();
    investors.add(row.investor_id);
    byTeam.set(row.team_id, investors);
  }
  return Object.fromEntries(
    [...byTeam].map(([teamId, investors]) => [teamId, investors.size]),
  );
}

export async function getInvestorHolding(
  investorId: string,
  teamId: string,
): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("investor_team_holdings")
    .select("holding")
    .eq("investor_id", investorId)
    .eq("team_id", teamId)
    .maybeSingle();
  throwIfError(error);
  return data?.holding ?? 0;
}
