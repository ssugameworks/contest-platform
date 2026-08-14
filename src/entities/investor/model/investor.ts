export interface Investor {
  id: string;
  studentId: string;
  name: string;
  totalBudget: number;
}

export const mockCurrentInvestor: Investor = {
  id: "investor-me",
  studentId: "20241001",
  name: "나",
  totalBudget: 100_000,
};

export const mockInvestors: Investor[] = [
  mockCurrentInvestor,
  {
    id: "investor-1",
    studentId: "20231001",
    name: "김지호",
    totalBudget: 100_000,
  },
  {
    id: "investor-2",
    studentId: "20231002",
    name: "박서준",
    totalBudget: 100_000,
  },
  {
    id: "investor-3",
    studentId: "20231003",
    name: "이하늘",
    totalBudget: 100_000,
  },
  {
    id: "investor-4",
    studentId: "20231004",
    name: "최유진",
    totalBudget: 100_000,
  },
  {
    id: "investor-5",
    studentId: "20231005",
    name: "정민서",
    totalBudget: 100_000,
  },
  {
    id: "investor-6",
    studentId: "20231006",
    name: "한소율",
    totalBudget: 100_000,
  },
];

const INITIAL_INVESTORS: Investor[] = structuredClone(mockInvestors);

export function getInvestorById(id: string): Investor | undefined {
  return mockInvestors.find((investor) => investor.id === id);
}

export function addInvestor(investor: Investor): void {
  mockInvestors.push(investor);
}

export function updateInvestor(id: string, patch: Partial<Investor>): void {
  const investor = getInvestorById(id);
  if (investor) Object.assign(investor, patch);
}

export function deleteInvestor(id: string): void {
  const index = mockInvestors.findIndex((investor) => investor.id === id);
  if (index >= 0) mockInvestors.splice(index, 1);
}

export function resetInvestors(): void {
  mockInvestors.length = 0;
  mockInvestors.push(...structuredClone(INITIAL_INVESTORS));
}
