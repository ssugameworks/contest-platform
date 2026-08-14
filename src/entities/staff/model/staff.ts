import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { Staff, StaffRole } from "./pure";

export type { Staff, StaffRole } from "./pure";
export { getCurrentStaff, setCurrentStaff } from "./pure";

// staff has no public SELECT policy (login ids/roles shouldn't be world
// readable) — reads go through the service-role client instead.
export async function listJudges(): Promise<Staff[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("staff")
    .select("id, name, role")
    .eq("role", "judge");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role as StaffRole,
  }));
}
