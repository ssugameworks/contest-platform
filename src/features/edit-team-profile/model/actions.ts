"use server";

import { requireParticipantTeamId } from "@/entities/session/model/session";
import { getTeamById } from "@/entities/team";
import {
  type TeamWriteInput,
  updateTeamAction,
} from "@/features/manage-team/model/actions";

export type MyTeamWriteInput = Omit<TeamWriteInput, "memberIds">;

// Resolves the target team from the session server-side instead of trusting
// a client-supplied teamId — a participant can only ever edit their own
// team through this entrypoint. Admin's manage-team-form still calls
// updateTeamAction directly (it needs to edit any team).
//
// memberIds isn't accepted from the client at all here: updateTeamAction
// forwards it straight into syncTeamMembers, which can reassign *any*
// participant (by student_id) onto this team — a participant calling this
// action directly with a tampered memberIds array could steal members from
// other teams. Team membership changes stay admin-only (manage-team-form);
// this action always keeps the team's current members untouched.
export async function updateMyTeamAction(
  input: MyTeamWriteInput,
): Promise<void> {
  const teamId = await requireParticipantTeamId();
  const team = await getTeamById(teamId);
  if (!team) throw new Error("팀을 찾을 수 없어요");
  await updateTeamAction(teamId, { ...input, memberIds: team.memberIds });
}
