"use server";

import { hashPassword, verifyPassword } from "@/shared/lib/session/password";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import type { StaffRole } from "./pure";
import { listJudges, type Staff } from "./staff";

export async function listJudgesAction(): Promise<Staff[]> {
  return listJudges();
}

// Runs through the service-role client rather than the public "staff"
// SELECT policy — login lookup shouldn't require exposing the whole
// staff table (ids/roles) to anyone holding the anon key.
export async function findStaffByIdAction(
  id: string,
  password: string,
): Promise<Staff | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("staff")
    .select("id, name, role, password_hash")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  if (!data.password_hash) {
    // Seeded without a password — this login registers the submitted one.
    // Conditioned on password_hash still being null so two concurrent first
    // logins can't stomp each other's password.
    const { data: claimed, error: claimError } = await supabase
      .from("staff")
      .update({ password_hash: hashPassword(password) })
      .eq("id", id)
      .is("password_hash", null)
      .select("password_hash");
    if (claimError) throw new Error(claimError.message);
    if (claimed.length === 0) {
      // Another request registered the password first; verify against it.
      const { data: retry, error: retryError } = await supabase
        .from("staff")
        .select("password_hash")
        .eq("id", id)
        .maybeSingle();
      if (retryError) throw new Error(retryError.message);
      if (
        !retry?.password_hash ||
        !verifyPassword(password, retry.password_hash)
      ) {
        return null;
      }
    }
  } else if (!verifyPassword(password, data.password_hash)) {
    return null;
  }

  return { id: data.id, name: data.name, role: data.role as StaffRole };
}
