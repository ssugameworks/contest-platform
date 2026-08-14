import { getSeedPhotoUrl } from "@/shared/lib/seed-photo";

export interface Team {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  landingPageUrl: string | null;
  memberIds: string[];
  tags: string[];
  screenshotUrls: string[];
}

export const mockTeam: Team = {
  id: "team-1",
  name: "감자탕집 사람들",
  description: "캠퍼스 배달 최적화 서비스를 만들고 있어요",
  imageUrl: null,
  landingPageUrl: null,
  memberIds: ["20231234", "20231235"],
  tags: ["AI", "커머스", "캠퍼스"],
  screenshotUrls: [
    getSeedPhotoUrl("team-1-a"),
    getSeedPhotoUrl("team-1-b"),
    getSeedPhotoUrl("team-1-c"),
  ],
};

export const mockTeams: Team[] = [
  mockTeam,
  {
    id: "team-2",
    name: "야행성 스터디",
    description: "심야 스터디 카페 자리 예약 서비스를 만들고 있어요",
    imageUrl: null,
    landingPageUrl: null,
    memberIds: ["20221101"],
    tags: ["생산성", "캠퍼스"],
    screenshotUrls: [getSeedPhotoUrl("team-2-a"), getSeedPhotoUrl("team-2-b")],
  },
  {
    id: "team-3",
    name: "동아리 정산봇",
    description: "동아리 회비 정산을 자동화하는 서비스를 만들고 있어요",
    imageUrl: null,
    landingPageUrl: null,
    memberIds: ["20221102"],
    tags: ["핀테크", "동아리"],
    screenshotUrls: [getSeedPhotoUrl("team-3-a"), getSeedPhotoUrl("team-3-b")],
  },
  {
    id: "team-4",
    name: "중고거래 안전결제",
    description: "캠퍼스 중고거래를 위한 안전결제 서비스를 만들고 있어요",
    imageUrl: null,
    landingPageUrl: null,
    memberIds: ["20201050"],
    tags: ["커머스", "핀테크"],
    screenshotUrls: [getSeedPhotoUrl("team-4-a"), getSeedPhotoUrl("team-4-b")],
  },
  {
    id: "team-5",
    name: "강의실 빈자리 찾기",
    description: "실시간 빈 강의실을 찾아주는 서비스를 만들고 있어요",
    imageUrl: null,
    landingPageUrl: null,
    memberIds: ["20211077"],
    tags: ["캠퍼스", "생산성"],
    screenshotUrls: [getSeedPhotoUrl("team-5-a"), getSeedPhotoUrl("team-5-b")],
  },
  {
    id: "team-6",
    name: "팀플 매칭",
    description: "전공별 팀플 파트너를 매칭해주는 서비스를 만들고 있어요",
    imageUrl: null,
    landingPageUrl: null,
    memberIds: [],
    tags: ["캠퍼스", "커뮤니티"],
    screenshotUrls: [getSeedPhotoUrl("team-6-a"), getSeedPhotoUrl("team-6-b")],
  },
];

const INITIAL_TEAMS: Team[] = structuredClone(mockTeams);

export function getTeamById(id: string): Team | undefined {
  return mockTeams.find((team) => team.id === id);
}

export function addTeam(team: Team): void {
  mockTeams.push(team);
}

export function updateTeam(id: string, patch: Partial<Team>): void {
  const team = getTeamById(id);
  if (team) Object.assign(team, patch);
}

export function deleteTeam(id: string): void {
  const index = mockTeams.findIndex((team) => team.id === id);
  if (index >= 0) mockTeams.splice(index, 1);
}

export function resetTeams(): void {
  mockTeams.length = 0;
  mockTeams.push(...structuredClone(INITIAL_TEAMS));
}
