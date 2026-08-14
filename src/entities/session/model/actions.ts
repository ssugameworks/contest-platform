"use server";

import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSession,
} from "@/shared/lib/session/cookie";
import { createAdminClient } from "@/shared/lib/supabase/admin";

// Server Actions have thrown Error messages stripped to a generic string in
// production builds, so the friendly copy below ("학번을 다시 확인해주세요"
// etc.) would silently disappear once deployed — return a plain result
// instead of throwing so the message actually reaches the client.
export type ActionResult<T = Record<never, never>> =
  | ({ ok: true } & T)
  | { ok: false; message: string };

async function setSessionCookie(studentId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, signSession(studentId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function participantLoginAction(
  studentId: string,
): Promise<ActionResult<{ teamId: string | null }>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("participants")
    .select("student_id, team_members(team_id)")
    .eq("student_id", studentId)
    .maybeSingle();
  if (error) {
    console.error(error);
    return { ok: false, message: "로그인에 실패했어요" };
  }
  if (!data) return { ok: false, message: "학번을 다시 확인해주세요" };

  await setSessionCookie(studentId);
  return { ok: true, teamId: data.team_members?.team_id ?? null };
}

export async function investorLoginOrSignupAction(
  studentId: string,
  name: string,
): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: investor, error: investorError } = await supabase
    .from("investors")
    .select("id")
    .eq("student_id", studentId)
    .maybeSingle();
  if (investorError) {
    console.error(investorError);
    return { ok: false, message: "가입에 실패했어요" };
  }
  if (investor) {
    await setSessionCookie(studentId);
    return { ok: true };
  }

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("student_id")
    .eq("student_id", studentId)
    .maybeSingle();
  if (participantError) {
    console.error(participantError);
    return { ok: false, message: "가입에 실패했어요" };
  }
  if (participant) {
    return {
      ok: false,
      message: "참가자로 등록된 학번은 투자자로 가입할 수 없어요",
    };
  }

  if (!name.trim()) return { ok: false, message: "이름을 입력해주세요" };

  // upsert + ignoreDuplicates instead of insert: two concurrent signups for
  // the same student_id would otherwise race on the unique constraint and
  // one request would surface a raw duplicate-key error instead of just
  // logging in.
  const { error: insertError } = await supabase
    .from("investors")
    .upsert(
      { student_id: studentId, name: name.trim() },
      { onConflict: "student_id", ignoreDuplicates: true },
    );
  if (insertError) {
    console.error(insertError);
    return { ok: false, message: "가입에 실패했어요" };
  }

  await setSessionCookie(studentId);
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
