"use server";

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

export async function uploadTeamImageAction(
  formData: FormData,
): Promise<string> {
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
  const supabase = createAdminClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
