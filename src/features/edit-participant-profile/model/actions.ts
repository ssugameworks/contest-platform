"use server";

import type { ActionResult } from "@/entities/session";
import { requireParticipantId } from "@/entities/session/model/session";
import { hashPassword, verifyPassword } from "@/shared/lib/session/password";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export interface ProfileWriteInput {
  name: string;
  avatarUrl: string | null;
}

export async function updateMyProfileAction(
  input: ProfileWriteInput,
): Promise<void> {
  const studentId = await requireParticipantId();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("participants")
    .update({ name: input.name, avatar_url: input.avatarUrl })
    .eq("student_id", studentId);
  if (error) throw new Error(error.message);
}

export async function changeMyPasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  const studentId = await requireParticipantId();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("participants")
    .select("password_hash")
    .eq("student_id", studentId)
    .maybeSingle();
  if (error || !data?.password_hash) {
    return { ok: false, message: "비밀번호 변경에 실패했어요" };
  }
  if (!verifyPassword(input.currentPassword, data.password_hash)) {
    return { ok: false, message: "현재 비밀번호가 일치하지 않아요" };
  }

  const { error: updateError } = await supabase
    .from("participants")
    .update({ password_hash: hashPassword(input.newPassword) })
    .eq("student_id", studentId);
  if (updateError) return { ok: false, message: "비밀번호 변경에 실패했어요" };

  return { ok: true };
}
