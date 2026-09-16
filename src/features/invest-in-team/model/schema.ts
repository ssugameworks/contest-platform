import { z } from "zod";
import { MIN_TRADE_AMOUNT } from "@/entities/investment/model/pure";

// Re-exported so actions.ts only needs "./schema" for every input
// validator — the schema itself lives with TransactionType in the entity
// layer (single source of truth for the enum's members).
export { transactionTypeSchema } from "@/entities/investment/model/pure";

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
