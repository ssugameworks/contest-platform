"use server";

import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { StaffRole } from "./pure";
import { listJudges, type Staff } from "./staff";

export async function listJudgesAction(): Promise<Staff[]> {
  return listJudges();
}

// Runs through the service-role client rather than the public "staff"
// SELECT policy — login lookup shouldn't require exposing the whole
// staff table (ids/roles) to anyone holding the anon key.
export async function findStaffByIdAction(id: string): Promise<Staff | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("staff")
    .select("id, name, role")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { id: data.id, name: data.name, role: data.role as StaffRole };
}
