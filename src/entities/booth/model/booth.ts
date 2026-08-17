import { throwIfError } from "@/shared/lib/supabase/query";
import { createClient } from "@/shared/lib/supabase/server";
import type { Booth, BoothMatrixConfig } from "./pure";

export type { Booth, BoothMatrixConfig } from "./pure";
export { formatBoothLocation } from "./pure";

export async function getBoothByTeamId(teamId: string): Promise<Booth | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("booths")
    .select("id, team_id, zone, number, blocked")
    .eq("team_id", teamId)
    .maybeSingle();
  throwIfError(error);
  if (!data) return null;
  return {
    id: data.id,
    teamId: data.team_id,
    zone: data.zone,
    number: data.number,
    blocked: data.blocked,
  };
}

export async function listBooths(): Promise<Booth[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("booths")
    .select("id, team_id, zone, number, blocked");
  throwIfError(error);
  return (data ?? []).map((booth) => ({
    id: booth.id,
    teamId: booth.team_id,
    zone: booth.zone,
    number: booth.number,
    blocked: booth.blocked,
  }));
}

export async function getBoothMatrixConfig(): Promise<BoothMatrixConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("booth_zones, booth_columns")
    .eq("id", true)
    .maybeSingle();
  throwIfError(error);
  return {
    zones: data?.booth_zones ?? [],
    columns: data?.booth_columns ?? 20,
  };
}
