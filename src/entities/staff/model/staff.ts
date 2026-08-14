import { createClient } from "@/shared/lib/supabase/server";
import type { Staff, StaffRole } from "./pure";

export type { Staff, StaffRole } from "./pure";
export { getCurrentStaff, setCurrentStaff } from "./pure";
export { findStaffById } from "./staff-client";

export async function listJudges(): Promise<Staff[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff")
    .select("id, name, role")
    .eq("role", "judge");
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role as StaffRole,
  }));
}
