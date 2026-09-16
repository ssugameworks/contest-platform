import type { z } from "zod";

// Several DB columns (role/status/type/kind) are plain `text` with no
// Postgres enum or CHECK constraint, so Supabase's generated types widen
// them to `string` — mapping functions used to just `as`-cast them to the
// app's literal union, trusting the DB unconditionally. This turns that
// trust into a real runtime check at the read boundary: a corrupted or
// unexpected value throws loudly instead of silently being treated as a
// valid member of the union.
export function parseKnownValue<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
  label: string,
): z.infer<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new Error(`${label}: 알 수 없는 값이에요 (${JSON.stringify(value)})`);
  }
  return parsed.data;
}
