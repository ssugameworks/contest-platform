export interface Booth {
  teamId: string;
  zone: string;
  number: number;
}

export const mockBooth: Booth = { teamId: "team-1", zone: "A", number: 12 };

export const mockBooths: Booth[] = [
  mockBooth,
  { teamId: "team-2", zone: "A", number: 13 },
  { teamId: "team-3", zone: "A", number: 14 },
  { teamId: "team-4", zone: "B", number: 5 },
  { teamId: "team-5", zone: "B", number: 6 },
  { teamId: "team-6", zone: "B", number: 7 },
];

export function formatBoothLocation(booth: Booth): string {
  return `${booth.zone}존 ${booth.number}번 부스`;
}

export function getBoothByTeamId(teamId: string): Booth | undefined {
  return mockBooths.find((booth) => booth.teamId === teamId);
}
