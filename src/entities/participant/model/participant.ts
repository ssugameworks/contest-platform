import { createAdminClient } from "@/shared/lib/supabase/admin";
import { throwIfError } from "@/shared/lib/supabase/query";

export interface Participant {
  studentId: string;
  name: string;
}

// participants has no public SELECT policy (student ids are PII) — reads
// go through the service-role client instead.
export async function listParticipants(): Promise<Participant[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("participants")
    .select("student_id, name");
  throwIfError(error);
  return (data ?? []).map((row) => ({
    studentId: row.student_id,
    name: row.name,
  }));
}
