"use server";

import { getCurrentUser } from "@/entities/session/model/session";
import { getCurrentStaff, requireAdmin } from "@/entities/staff/model/session";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export interface TeamWriteInput {
  name: string;
  description: string;
  imageUrl: string | null;
  landingPageUrl: string | null;
  tags: string[];
  screenshotUrls: string[];
}

const TEAM_ASSETS_BUCKET = "team-assets";

// Admin (manage-team-form) or any logged-in participant (their own team's
// edit-team-profile-form) may upload — this action has no team context of
// its own, so it can only rule out fully anonymous callers, not verify
// ownership of a specific team (updateTeamAction does that check itself).
async function requireStaffOrParticipant(): Promise<void> {
  const [staff, user] = await Promise.all([
    getCurrentStaff(),
    getCurrentUser(),
  ]);
  if (staff?.role === "admin") return;
  if (user?.kind === "participant") return;
  throw new Error("권한이 없어요");
}

async function requireAdminOrTeamOwner(teamId: string): Promise<void> {
  const [staff, user] = await Promise.all([
    getCurrentStaff(),
    getCurrentUser(),
  ]);
  if (staff?.role === "admin") return;
  if (user?.kind === "participant" && user.teamId === teamId) return;
  throw new Error("권한이 없어요");
}

export async function uploadTeamImageAction(
  formData: FormData,
): Promise<string> {
  await requireStaffOrParticipant();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("파일이 없어요");

  const supabase = createAdminClient();
  const extension = file.name.split(".").pop() ?? "png";
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(TEAM_ASSETS_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from(TEAM_ASSETS_BUCKET).getPublicUrl(path);
  return publicUrl;
}

export async function createTeamAction(input: TeamWriteInput): Promise<string> {
  await requireAdmin();
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
  return data.id;
}

export async function updateTeamAction(
  id: string,
  input: TeamWriteInput,
): Promise<void> {
  await requireAdminOrTeamOwner(id);
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
}

export async function deleteTeamAction(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
