"use server";

import { requireAdmin } from "@/entities/staff/model/session";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createBoothSchema } from "./schema";

export async function createBoothAction(
  zone: string,
  number: number,
): Promise<void> {
  await requireAdmin();
  const parsed = createBoothSchema.parse({ zone, number });
  const supabase = createAdminClient();
  const { error } = await supabase.from("booths").insert(parsed);
  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 존재하는 위치예요");
    }
    throw new Error(error.message);
  }
}

export async function deleteBoothAction(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("booths").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function assignTeamToBoothAction(
  boothId: string,
  teamId: string | null,
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();

  if (teamId) {
    // team_id에 걸린 부분 유니크 인덱스 때문에, 그 팀이 이미 다른 부스를
    // 차지하고 있으면 먼저 풀어줘야 새 부스에 배정할 수 있어요.
    const { error: releaseError } = await supabase
      .from("booths")
      .update({ team_id: null })
      .eq("team_id", teamId)
      .neq("id", boothId);
    if (releaseError) throw new Error(releaseError.message);
  }

  const { error } = await supabase
    .from("booths")
    .update({ team_id: teamId })
    .eq("id", boothId);
  if (error) throw new Error(error.message);
}

export async function setBoothBlockedAction(
  boothId: string,
  blocked: boolean,
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  // 막힌 자리엔 팀을 둘 수 없어서, 막을 때는 배정도 같이 풀어요.
  const { error } = await supabase
    .from("booths")
    .update({ blocked, team_id: blocked ? null : undefined })
    .eq("id", boothId);
  if (error) throw new Error(error.message);
}

export async function setBoothMatrixConfigAction(
  zones: string[],
  columns: number,
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ booth_zones: zones, booth_columns: columns })
    .eq("id", true);
  if (error) throw new Error(error.message);
}
