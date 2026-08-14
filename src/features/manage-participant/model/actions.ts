"use server";

import { createAdminClient } from "@/shared/lib/supabase/admin";
import { manageParticipantSchema } from "./schema";

export interface ParticipantWriteInput {
  studentId: string;
  name: string;
  teamId: string | null;
}

// student_id is team_members' PK, so upserting onConflict(student_id) also
// reassigns a participant who currently belongs to a different team.
async function syncParticipantTeam(studentId: string, teamId: string | null) {
  const supabase = createAdminClient();
  if (teamId) {
    const { error } = await supabase
      .from("team_members")
      .upsert(
        { student_id: studentId, team_id: teamId },
        { onConflict: "student_id" },
      );
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("student_id", studentId);
    if (error) throw new Error(error.message);
  }
}

export async function createParticipantAction(
  input: ParticipantWriteInput,
): Promise<void> {
  const parsed = manageParticipantSchema.parse(input);
  const supabase = createAdminClient();
  const { error } = await supabase.from("participants").insert({
    student_id: parsed.studentId,
    name: parsed.name,
  });
  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 등록된 학번이에요");
    }
    throw new Error(error.message);
  }
  await syncParticipantTeam(parsed.studentId, parsed.teamId);
}

export async function updateParticipantAction(
  studentId: string,
  input: Pick<ParticipantWriteInput, "name" | "teamId">,
): Promise<void> {
  const parsed = manageParticipantSchema
    .pick({ name: true, teamId: true })
    .parse(input);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("participants")
    .update({ name: parsed.name })
    .eq("student_id", studentId);
  if (error) throw new Error(error.message);
  await syncParticipantTeam(studentId, parsed.teamId);
}

export async function deleteParticipantAction(
  studentId: string,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("student_id", studentId);
  if (error) throw new Error(error.message);
}
