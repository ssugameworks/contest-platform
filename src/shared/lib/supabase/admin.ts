import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Bypasses Row Level Security via the secret key — server-only, never
 * import this from a Client Component or anything bundled to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SECRET_KEY as string,
    { auth: { persistSession: false } },
  );
}
