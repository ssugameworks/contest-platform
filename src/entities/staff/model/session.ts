import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import {
  STAFF_SESSION_COOKIE_NAME,
  verifySession,
} from "@/shared/lib/session/cookie";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { throwIfError } from "@/shared/lib/supabase/query";
import type { Staff, StaffRole } from "./pure";

// staff has no public SELECT policy, so this always goes through the
// service-role client — same pattern as getCurrentUser for participants.
export const getCurrentStaff = cache(async (): Promise<Staff | null> => {
  const store = await cookies();
  const id = verifySession(
    store.get(STAFF_SESSION_COOKIE_NAME)?.value,
    "staff",
  );
  if (!id) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("staff")
    .select("id, name, role")
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  return data
    ? { id: data.id, name: data.name, role: data.role as StaffRole }
    : null;
});

export async function requireStaff(): Promise<Staff> {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/admin/login");
  return staff;
}

export async function requireAdmin(): Promise<Staff> {
  const staff = await requireStaff();
  // Not logged in at all → requireStaff already sent them to /admin/login.
  // Logged in as staff but the wrong role (e.g. a judge) → distinct page,
  // since bouncing back to the login form would look like login failed.
  if (staff.role !== "admin") redirect("/admin/forbidden");
  return staff;
}

// An admin browsing to /judge/dashboard and submitting a score would create
// a phantom "judge" evaluation under the admin's own staff id, skewing the
// leaderboard average — judge-only surfaces need this, not requireStaff().
export async function requireJudge(): Promise<Staff> {
  const staff = await requireStaff();
  if (staff.role !== "judge") redirect("/admin/forbidden");
  return staff;
}
