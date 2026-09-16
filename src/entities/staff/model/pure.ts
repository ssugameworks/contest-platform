// No supabase imports here — client components import this file directly
// (not via ./index.ts) so they don't pull in the server-only Supabase client.
import { z } from "zod";

export type StaffRole = "admin" | "judge";
export const staffRoleSchema = z.enum(["admin", "judge"]);

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
}
