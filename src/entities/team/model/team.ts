import { throwIfError } from "@/shared/lib/supabase/query";
import { createClient } from "@/shared/lib/supabase/server";

// 인증이 없어 "내 팀"을 구분할 방법이 없다 — mockTeam과 동일한 한계로, seed
// 데이터의 첫 팀을 고정 placeholder로 취급한다. 인증이 붙으면 세션의 팀
// 소속으로 바꿀 것.
export const PLACEHOLDER_TEAM_ID = "a0000000-0000-4000-8000-000000000001";

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

interface TeamRow {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  landing_page_url: string | null;
  tags: string[] | null;
  screenshot_urls: string[] | null;
  team_members: { student_id: string }[];
}

function mapTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    landingPageUrl: row.landing_page_url,
    memberIds: row.team_members.map((member) => member.student_id),
    tags: row.tags ?? [],
    screenshotUrls: row.screenshot_urls ?? [],
  };
}

const TEAM_SELECT =
  "id, name, description, image_url, landing_page_url, tags, screenshot_urls, team_members(student_id)";

export async function getTeamById(id: string): Promise<Team | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select(TEAM_SELECT)
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  return data ? mapTeam(data) : null;
}

export async function listTeams(): Promise<Team[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select(TEAM_SELECT)
    .order("created_at", { ascending: true });
  throwIfError(error);
  return (data ?? []).map(mapTeam);
}
