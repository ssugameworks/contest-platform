import { z } from "zod";
import { MIN_TRADE_AMOUNT } from "@/entities/investment/model/pure";

export function createTradeAmountSchema(maxAmount: number) {
  return z.object({
    amount: z
      .number()
      .min(
        MIN_TRADE_AMOUNT,
        `최소 ${MIN_TRADE_AMOUNT.toLocaleString()}원부터 가능해요`,
      )
      .max(maxAmount, "보유 잔액을 초과했어요"),
  });
}

export interface TradeAmountInput {
  amount: number;
}
