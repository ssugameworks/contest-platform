import { createClient } from "@/shared/lib/supabase/server";
import type { Investment, Transaction, TransactionType } from "./pure";

export type { Investment, Transaction, TransactionType } from "./pure";
export { maskInvestorName } from "./pure";

export async function getTeamInvestmentTotals(): Promise<Investment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_investment_totals")
    .select("team_id, amount");
  return (data ?? []).map((row) => ({
    teamId: row.team_id as string,
    amount: row.amount ?? 0,
  }));
}

export async function getTeamInvestmentTotal(teamId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_investment_totals")
    .select("amount")
    .eq("team_id", teamId)
    .maybeSingle();
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

export async function getTransactions(teamId: string): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("id, team_id, investor_id, type, amount, investors(name)")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((tx) => ({
    id: tx.id,
    teamId: tx.team_id,
    investorId: tx.investor_id,
    investorName: tx.investors?.name ?? "",
    type: tx.type as TransactionType,
    amount: tx.amount,
  }));
}

export async function getInvestorCount(teamId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("investor_id")
    .eq("team_id", teamId);
  return new Set((data ?? []).map((row) => row.investor_id)).size;
}

export async function getInvestorHolding(
  investorId: string,
  teamId: string,
): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("investor_team_holdings")
    .select("holding")
    .eq("investor_id", investorId)
    .eq("team_id", teamId)
    .maybeSingle();
  return data?.holding ?? 0;
}
