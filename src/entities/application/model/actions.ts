"use server";

import type { ActionResult } from "@/entities/session";
import {
  type ApplicationInput,
  createApplication,
  findApplicationByStudentId,
} from "./application";
import { applicationSchema } from "./schema";

const STUDENT_ID_REGEX = /^\d{8}$/;

// Non-blocking early warning (called on studentId blur) — the authoritative
// check is the unique constraint hit inside submitApplicationAction, so a
// failure here should never stop the applicant from continuing to fill out
// the form.
//
// This is also a public existence-check ("has this student ID already
// applied?"), so it doubles as an enumeration oracle — rejecting anything
// that isn't a well-formed student ID at least keeps it from being a free
// probe for arbitrary input, though it doesn't fully close off enumerating
// real 8-digit IDs. There's no rate limiting here (none exists anywhere
// else in this app's login actions either); revisit if abuse shows up.
export async function checkStudentIdAvailableAction(
  studentId: string,
): Promise<boolean> {
  if (!STUDENT_ID_REGEX.test(studentId)) return true;
  try {
    return !(await findApplicationByStudentId(studentId));
  } catch (error) {
    console.error(error);
    return true;
  }
}

// A Server Action is a callable HTTP endpoint, not just a function the form
// happens to call — anything reaching this point over the network may not
// have gone through the client's zodResolver at all, so the same schema is
// re-applied here before touching the database.
export async function submitApplicationAction(
  input: ApplicationInput,
): Promise<ActionResult> {
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "입력값을 다시 확인해주세요" };
  }

  try {
    await createApplication(parsed.data);
    return { ok: true };
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error && error.message.includes("duplicate key")
        ? "이미 지원 내역이 있어요"
        : "제출에 실패했어요. 잠시 후 다시 시도해주세요";
    return { ok: false, message };
  }
}
