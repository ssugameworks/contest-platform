import type { PostgrestError } from "@supabase/supabase-js";

// Supabase query results carry {data, error} separately — destructuring only
// `data` silently turns RLS denials / network errors into an empty/zero
// result. Call this on the error half so failures throw instead of looking
// like valid empty data; keep using the naturally-inferred `data` after.
export function throwIfError(error: PostgrestError | null): void {
  if (error) throw new Error(error.message);
}
