"use server";

import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSession,
} from "@/shared/lib/session/cookie";
import { createAdminClient } from "@/shared/lib/supabase/admin";

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
): Promise<{ teamId: string | null }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("participants")
    .select("student_id, team_members(team_id)")
    .eq("student_id", studentId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("학번을 다시 확인해주세요");

  await setSessionCookie(studentId);
  return { teamId: data.team_members?.team_id ?? null };
}

export async function investorLoginOrSignupAction(
  studentId: string,
  name: string,
): Promise<void> {
  const supabase = createAdminClient();

  const { data: investor, error: investorError } = await supabase
    .from("investors")
    .select("id")
    .eq("student_id", studentId)
    .maybeSingle();
  if (investorError) throw new Error(investorError.message);
  if (investor) {
    await setSessionCookie(studentId);
    return;
  }

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("student_id")
    .eq("student_id", studentId)
    .maybeSingle();
  if (participantError) throw new Error(participantError.message);
  if (participant) {
    throw new Error("참가자로 등록된 학번은 투자자로 가입할 수 없어요");
  }

  if (!name.trim()) throw new Error("이름을 입력해주세요");
  const { error: insertError } = await supabase.from("investors").insert({
    student_id: studentId,
    name: name.trim(),
  });
  if (insertError) throw new Error(insertError.message);

  await setSessionCookie(studentId);
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
