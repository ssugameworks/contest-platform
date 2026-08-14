"use server";

import { createAdminClient } from "@/shared/lib/supabase/admin";

export interface TeamWriteInput {
  name: string;
  description: string;
  imageUrl: string | null;
  landingPageUrl: string | null;
  tags: string[];
  screenshotUrls: string[];
  memberIds: string[];
}

async function syncTeamMembers(teamId: string, memberIds: string[]) {
  const supabase = createAdminClient();

  const { data: current } = await supabase
    .from("team_members")
    .select("student_id")
    .eq("team_id", teamId);
  const toRemove = (current ?? [])
    .map((row) => row.student_id)
    .filter((studentId) => !memberIds.includes(studentId));

  if (toRemove.length > 0) {
    await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .in("student_id", toRemove);
  }

  if (memberIds.length > 0) {
    // upsert onConflict(student_id) — since student_id is the PK, this also
    // reassigns a participant who currently belongs to a different team.
    await supabase.from("team_members").upsert(
      memberIds.map((studentId) => ({
        student_id: studentId,
        team_id: teamId,
      })),
      { onConflict: "student_id" },
    );
  }
}

export async function createTeamAction(input: TeamWriteInput): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("teams")
    .insert({
      name: input.name,
      description: input.description,
      image_url: input.imageUrl,
      landing_page_url: input.landingPageUrl,
      tags: input.tags,
      screenshot_urls: input.screenshotUrls,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "팀 생성에 실패했어요");

  await syncTeamMembers(data.id, input.memberIds);
  return data.id;
}

export async function updateTeamAction(
  id: string,
  input: TeamWriteInput,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("teams")
    .update({
      name: input.name,
      description: input.description,
      image_url: input.imageUrl,
      landing_page_url: input.landingPageUrl,
      tags: input.tags,
      screenshot_urls: input.screenshotUrls,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await syncTeamMembers(id, input.memberIds);
}

export async function deleteTeamAction(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
