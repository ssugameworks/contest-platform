import { createClient } from "@/shared/lib/supabase/server";
import type { Booth } from "./pure";

export type { Booth } from "./pure";
export { formatBoothLocation } from "./pure";

export async function getBoothByTeamId(teamId: string): Promise<Booth | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booths")
    .select("team_id, zone, number")
    .eq("team_id", teamId)
    .maybeSingle();
  if (!data) return null;
  return { teamId: data.team_id, zone: data.zone, number: data.number };
}

export async function listBooths(): Promise<Booth[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("booths")
    .select("team_id, zone, number");
  return (data ?? []).map((booth) => ({
    teamId: booth.team_id,
    zone: booth.zone,
    number: booth.number,
  }));
}
