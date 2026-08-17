import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "session";
// Separate cookie/name from participant/investor sessions — staff is a
// different actor type, and a browser could plausibly hold both (e.g. an
// organizer testing the participant flow while also logged in as admin).
export const STAFF_SESSION_COOKIE_NAME = "staff_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

// Bound into the signed payload so a token issued for one cookie can't be
// replayed into the other — e.g. an investor signing up with studentId
// "admin" would otherwise get a validly-signed "admin" token that could be
// pasted into staff_session to pass as the real admin.
export type SessionActor = "user" | "staff";

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

// Fails loudly at first use instead of letting a missing/empty secret
// either crash createHmac with a cryptic error or, worse, silently sign
// with an empty key.
function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET is missing or too short (>= 16 chars)");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function signSession(id: string, actor: SessionActor): string {
  const payload = base64url(JSON.stringify({ id, actor, iat: Date.now() }));
  return `${payload}.${sign(payload)}`;
}

// Returns the id if the cookie is well-formed, signed correctly, was issued
// for the expected actor, and not expired — otherwise null. Checking `iat`
// server-side matters because the cookie's `maxAge` is only enforced by the
// browser; a raw copy of the token value would otherwise stay valid forever.
export function verifySession(
  token: string | undefined,
  actor: SessionActor,
): string | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (
      typeof parsed.id !== "string" ||
      parsed.actor !== actor ||
      typeof parsed.iat !== "number"
    ) {
      return null;
    }
    if (Date.now() - parsed.iat > SESSION_MAX_AGE_SECONDS * 1000) return null;
    return parsed.id;
  } catch {
    return null;
  }
}
