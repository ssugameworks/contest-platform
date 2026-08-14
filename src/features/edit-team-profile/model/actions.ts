"use server";

import { requireParticipantTeamId } from "@/entities/session/model/session";
import {
  type TeamWriteInput,
  updateTeamAction,
} from "@/features/manage-team/model/actions";

// Resolves the target team from the session server-side instead of trusting
// a client-supplied teamId — a participant can only ever edit their own
// team through this entrypoint. Admin's manage-team-form still calls
// updateTeamAction directly (it needs to edit any team). Team membership
// itself is assigned from participant management, not here — updateTeamAction
// no longer touches team_members at all, for any caller.
export async function updateMyTeamAction(input: TeamWriteInput): Promise<void> {
  const teamId = await requireParticipantTeamId();
  await updateTeamAction(teamId, input);
}
