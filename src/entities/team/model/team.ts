import { throwIfError } from "@/shared/lib/supabase/query";
import { createClient } from "@/shared/lib/supabase/server";

export interface Team {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  githubUrl: string | null;
  memberIds: string[];
  tags: string[];
  screenshotUrls: string[];
}

interface TeamRow {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  github_url: string | null;
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
    githubUrl: row.github_url,
    memberIds: row.team_members.map((member) => member.student_id),
    tags: row.tags ?? [],
    screenshotUrls: row.screenshot_urls ?? [],
  };
}

const TEAM_SELECT =
  "id, name, description, image_url, github_url, tags, screenshot_urls, team_members(student_id)";

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
