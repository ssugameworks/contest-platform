// No supabase imports here — client components import this file directly
// (not via ./index.ts) so they don't pull in the server-only Supabase client.
export type StaffRole = "admin" | "judge";

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
}
