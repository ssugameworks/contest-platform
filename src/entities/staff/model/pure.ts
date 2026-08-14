// No supabase imports here — client components import this file directly
// (not via ./index.ts) so they don't pull in the server-only Supabase client.
export type StaffRole = "admin" | "judge";

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
}

let currentStaff: Staff | null = null;

export function setCurrentStaff(staff: Staff | null): void {
  currentStaff = staff;
}

export function getCurrentStaff(): Staff | null {
  return currentStaff;
}
