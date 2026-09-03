import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
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
      avatarUrl: string | null;
    }
  | { kind: "investor"; studentId: string; name: string; investorId: string };

// participants/investors have no public SELECT policy, so this always goes
// through the service-role client — same pattern as the other entities.
// Wrapped in cache() so a layout + several pages calling this in the same
// request only hit the DB once (React request memoization, not fetch()).
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const store = await cookies();
  const studentId = verifySession(
    store.get(SESSION_COOKIE_NAME)?.value,
    "user",
  );
  if (!studentId) return null;

  const supabase = createAdminClient();

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("student_id, name, avatar_url, team_members(team_id)")
    .eq("student_id", studentId)
    .maybeSingle();
  throwIfError(participantError);
  if (participant) {
    return {
      kind: "participant",
      studentId: participant.student_id,
      name: participant.name,
      teamId: participant.team_members?.team_id ?? null,
      avatarUrl: participant.avatar_url,
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
});

// Guards participant-only routes (the participant dashboard). Not logged in
// and "logged in but no team assigned yet" both bounce to /login — the
// latter can't happen with the current seed data (every participant has a
// team), so a dedicated message isn't worth building until it does.
export async function requireParticipantTeamId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user || user.kind !== "participant" || !user.teamId) {
    redirect("/login");
  }
  return user.teamId;
}

// Guards participant self-service actions (editing my name/avatar/password)
// that don't depend on team assignment — unlike requireParticipantTeamId,
// a participant without a team can still use these.
export async function requireParticipantId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user || user.kind !== "participant") {
    redirect("/login");
  }
  return user.studentId;
}
