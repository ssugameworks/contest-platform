import { z } from "zod";

export function createTradeAmountSchema(maxAmount: number) {
  return z.object({
    amount: z
      .number()
      .min(1000, "최소 1,000원부터 가능해요")
      .max(maxAmount, "보유 잔액을 초과했어요"),
  });
}

export interface TradeAmountInput {
  amount: number;
}
