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
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// The client's <input accept> and the FormData's declared file.type are both
// just claims from the caller — a Server Action can be called directly with
// arbitrary FormData, bypassing the file picker entirely. Sniffing the magic
// bytes is the only check that actually reflects what's being uploaded to a
// public bucket.
const IMAGE_SIGNATURES: { mime: string; magic: number[] }[] = [
  { mime: "image/png", magic: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
  { mime: "image/gif", magic: [0x47, 0x49, 0x46, 0x38] },
  // WEBP: "RIFF" .... "WEBP" — bytes 8-11 checked separately below.
  { mime: "image/webp", magic: [0x52, 0x49, 0x46, 0x46] },
];

async function sniffImageType(file: File): Promise<string | null> {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  for (const { mime, magic } of IMAGE_SIGNATURES) {
    if (magic.every((byte, i) => header[i] === byte)) {
      if (mime !== "image/webp") return mime;
      const isWebp =
        header[8] === 0x57 &&
        header[9] === 0x45 &&
        header[10] === 0x42 &&
        header[11] === 0x50;
      if (isWebp) return mime;
    }
  }
  return null;
}

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
  if (file.size > MAX_IMAGE_BYTES)
    throw new Error("파일이 너무 커요 (5MB 이하)");

  const detectedType = await sniffImageType(file);
  if (!detectedType) throw new Error("이미지 파일만 업로드할 수 있어요");

  const supabase = createAdminClient();
  const extension = detectedType.split("/")[1];
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(TEAM_ASSETS_BUCKET)
    .upload(path, file, { contentType: detectedType });
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
