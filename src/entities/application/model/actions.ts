"use server";

import type { ActionResult } from "@/entities/session";
import {
  type ApplicationInput,
  createApplication,
  findApplicationByStudentId,
} from "./application";

// Non-blocking early warning (called on studentId blur) — the authoritative
// check is the unique constraint hit inside submitApplicationAction, so a
// failure here should never stop the applicant from continuing to fill out
// the form.
export async function checkStudentIdAvailableAction(
  studentId: string,
): Promise<boolean> {
  try {
    return !(await findApplicationByStudentId(studentId));
  } catch (error) {
    console.error(error);
    return true;
  }
}

export async function submitApplicationAction(
  input: ApplicationInput,
): Promise<ActionResult> {
  try {
    await createApplication(input);
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
