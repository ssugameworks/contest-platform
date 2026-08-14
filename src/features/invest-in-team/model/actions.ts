"use server";

import {
  getInvestorHolding,
  type TransactionType,
} from "@/entities/investment";
import { getCurrentInvestor, getInvestorBudget } from "@/entities/investor";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export interface TradeContext {
  investorId: string;
  investorName: string;
  remainingBudget: number;
  holding: number;
}

export async function getTradeContextAction(
  teamId: string,
): Promise<TradeContext | null> {
  const investor = await getCurrentInvestor();
  if (!investor) return null;

  const [remainingBudget, holding] = await Promise.all([
    getInvestorBudget(investor.id),
    getInvestorHolding(investor.id, teamId),
  ]);

  return {
    investorId: investor.id,
    investorName: investor.name,
    remainingBudget,
    holding,
  };
}

export async function placeTradeAction(
  teamId: string,
  type: TransactionType,
  amount: number,
): Promise<void> {
  const investor = await getCurrentInvestor();
  if (!investor) throw new Error("투자자로 로그인해주세요");

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("place_trade", {
    p_investor_id: investor.id,
    p_team_id: teamId,
    p_type: type,
    p_amount: amount,
  });
  if (error) throw new Error(error.message);
}
