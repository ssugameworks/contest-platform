"use server";

import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSession,
} from "@/shared/lib/session/cookie";
import { hashPassword, verifyPassword } from "@/shared/lib/session/password";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const CREDENTIAL_ERROR = "학번 또는 비밀번호를 확인해주세요";

// Server Actions have thrown Error messages stripped to a generic string in
// production builds, so the friendly copy below ("학번을 다시 확인해주세요"
// etc.) would silently disappear once deployed — return a plain result
// instead of throwing so the message actually reaches the client.
export type ActionResult<T = Record<never, never>> =
  | ({ ok: true } & T)
  | { ok: false; message: string };

async function setSessionCookie(studentId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, signSession(studentId, "user"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function participantLoginAction(
  studentId: string,
  password: string,
): Promise<ActionResult<{ teamId: string | null }>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("participants")
    .select("password_hash, team_members(team_id)")
    .eq("student_id", studentId)
    .maybeSingle();
  if (error) {
    console.error(error);
    return { ok: false, message: "로그인에 실패했어요" };
  }
  if (!data) return { ok: false, message: CREDENTIAL_ERROR };

  let passwordHash = data.password_hash;
  if (!passwordHash) {
    passwordHash = hashPassword(password);
    // Conditioned on password_hash still being null so two concurrent first
    // logins for the same student_id can't stomp each other's password.
    const { data: claimed, error: claimError } = await supabase
      .from("participants")
      .update({ password_hash: passwordHash })
      .eq("student_id", studentId)
      .is("password_hash", null)
      .select("password_hash");
    if (claimError) {
      console.error(claimError);
      return { ok: false, message: "로그인에 실패했어요" };
    }
    if (claimed.length === 0) {
      // Another request registered the password first; verify against it.
      const { data: retry, error: retryError } = await supabase
        .from("participants")
        .select("password_hash")
        .eq("student_id", studentId)
        .maybeSingle();
      if (retryError || !retry?.password_hash) {
        console.error(retryError);
        return { ok: false, message: "로그인에 실패했어요" };
      }
      passwordHash = retry.password_hash;
      if (!verifyPassword(password, passwordHash)) {
        return { ok: false, message: CREDENTIAL_ERROR };
      }
    }
  } else if (!verifyPassword(password, passwordHash)) {
    return { ok: false, message: CREDENTIAL_ERROR };
  }

  await setSessionCookie(studentId);
  return { ok: true, teamId: data.team_members?.team_id ?? null };
}

export async function investorLoginOrSignupAction(
  studentId: string,
  name: string,
  password: string,
): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: investor, error: investorError } = await supabase
    .from("investors")
    .select("id, password_hash")
    .eq("student_id", studentId)
    .maybeSingle();
  if (investorError) {
    console.error(investorError);
    return { ok: false, message: "가입에 실패했어요" };
  }
  if (investor) {
    if (!investor.password_hash) {
      // Pre-existing account from before passwords were required — this
      // login registers the submitted password, same as a first login.
      const { error: claimError } = await supabase
        .from("investors")
        .update({ password_hash: hashPassword(password) })
        .eq("id", investor.id)
        .is("password_hash", null);
      if (claimError) {
        console.error(claimError);
        return { ok: false, message: "로그인에 실패했어요" };
      }
    } else if (!verifyPassword(password, investor.password_hash)) {
      return { ok: false, message: CREDENTIAL_ERROR };
    }
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
  if (!password) return { ok: false, message: "비밀번호를 입력해주세요" };

  // upsert + ignoreDuplicates instead of insert: two concurrent signups for
  // the same student_id would otherwise race on the unique constraint and
  // one request would surface a raw duplicate-key error instead of just
  // logging in.
  const { error: insertError } = await supabase.from("investors").upsert(
    {
      student_id: studentId,
      name: name.trim(),
      password_hash: hashPassword(password),
    },
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
