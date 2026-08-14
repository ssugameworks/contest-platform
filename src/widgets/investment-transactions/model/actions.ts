"use server";

import { getTransactions, type Transaction } from "@/entities/investment";

export async function getTransactionsAction(
  teamId: string,
  anonymize = false,
): Promise<Transaction[]> {
  return getTransactions(teamId, { anonymize });
}
