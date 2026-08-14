"use server";

import { getTransactions, type Transaction } from "@/entities/investment";

export async function getTransactionsAction(
  teamId: string,
): Promise<Transaction[]> {
  return getTransactions(teamId);
}
