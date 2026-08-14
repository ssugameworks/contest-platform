// No supabase imports here — client components import this file directly
// (not via ./index.ts) so they don't pull in the server-only Supabase client.
export type TransactionType = "buy" | "sell";

export interface Investment {
  teamId: string;
  amount: number;
}

export interface Transaction {
  id: string;
  teamId: string;
  investorId: string;
  investorName: string;
  type: TransactionType;
  amount: number;
}

export function maskInvestorName(name: string): string {
  return `${name.charAt(0)}○○`;
}
