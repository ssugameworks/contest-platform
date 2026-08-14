export interface Investment {
  teamId: string;
  amount: number;
}

export const mockInvestment: Investment = {
  teamId: "team-1",
  amount: 3_200_000,
};

export const mockLeaderboard: Investment[] = [
  mockInvestment,
  { teamId: "team-2", amount: 5_400_000 },
  { teamId: "team-3", amount: 2_100_000 },
  { teamId: "team-4", amount: 4_000_000 },
  { teamId: "team-5", amount: 1_500_000 },
  { teamId: "team-6", amount: 900_000 },
];

export function getInvestmentRank(teamId: string): {
  rank: number;
  totalTeams: number;
} {
  const sorted = [...mockLeaderboard].sort((a, b) => b.amount - a.amount);
  return {
    rank: sorted.findIndex((i) => i.teamId === teamId) + 1,
    totalTeams: sorted.length,
  };
}

export function getInvestorCount(teamId: string): number {
  return new Set(
    mockTransactions
      .filter((tx) => tx.teamId === teamId)
      .map((tx) => tx.investorId),
  ).size;
}

export function maskInvestorName(name: string): string {
  return `${name.charAt(0)}○○`;
}

export type TransactionType = "buy" | "sell";

export interface Transaction {
  id: string;
  teamId: string;
  investorId: string;
  investorName: string;
  type: TransactionType;
  amount: number;
}

export const mockTransactions: Transaction[] = [
  {
    id: "tx-1",
    teamId: "team-1",
    investorId: "investor-1",
    investorName: "김지호",
    type: "buy",
    amount: 500_000,
  },
  {
    id: "tx-2",
    teamId: "team-1",
    investorId: "investor-2",
    investorName: "박서준",
    type: "buy",
    amount: 1_200_000,
  },
  {
    id: "tx-3",
    teamId: "team-1",
    investorId: "investor-3",
    investorName: "이하늘",
    type: "sell",
    amount: 300_000,
  },
  {
    id: "tx-4",
    teamId: "team-1",
    investorId: "investor-4",
    investorName: "최유진",
    type: "buy",
    amount: 800_000,
  },
  {
    id: "tx-5",
    teamId: "team-1",
    investorId: "investor-5",
    investorName: "정민서",
    type: "sell",
    amount: 200_000,
  },
  {
    id: "tx-6",
    teamId: "team-1",
    investorId: "investor-6",
    investorName: "한소율",
    type: "buy",
    amount: 700_000,
  },
];
