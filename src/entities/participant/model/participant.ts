import { createClient } from "@/shared/lib/supabase/server";

export interface Participant {
  studentId: string;
  name: string;
}

export async function listParticipants(): Promise<Participant[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participants")
    .select("student_id, name");
  return (data ?? []).map((row) => ({
    studentId: row.student_id,
    name: row.name,
  }));
}
