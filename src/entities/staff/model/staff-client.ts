// Uses the browser Supabase client only (no next/headers) — safe to import
// directly from "use client" components, unlike ./staff.ts.
import { createClient } from "@/shared/lib/supabase/client";
import type { Staff, StaffRole } from "./pure";

export async function findStaffById(id: string): Promise<Staff | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("staff")
    .select("id, name, role")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, name: data.name, role: data.role as StaffRole };
}
