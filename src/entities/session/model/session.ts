import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  verifySession,
} from "@/shared/lib/session/cookie";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { throwIfError } from "@/shared/lib/supabase/query";

export type CurrentUser =
  | {
      kind: "participant";
      studentId: string;
      name: string;
      teamId: string | null;
    }
  | { kind: "investor"; studentId: string; name: string; investorId: string };

// participants/investors have no public SELECT policy, so this always goes
// through the service-role client — same pattern as the other entities.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const studentId = verifySession(store.get(SESSION_COOKIE_NAME)?.value);
  if (!studentId) return null;

  const supabase = createAdminClient();

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("student_id, name, team_members(team_id)")
    .eq("student_id", studentId)
    .maybeSingle();
  throwIfError(participantError);
  if (participant) {
    return {
      kind: "participant",
      studentId: participant.student_id,
      name: participant.name,
      teamId: participant.team_members?.team_id ?? null,
    };
  }

  const { data: investor, error: investorError } = await supabase
    .from("investors")
    .select("id, student_id, name")
    .eq("student_id", studentId)
    .maybeSingle();
  throwIfError(investorError);
  if (investor) {
    return {
      kind: "investor",
      studentId: investor.student_id,
      name: investor.name,
      investorId: investor.id,
    };
  }

  return null;
}
