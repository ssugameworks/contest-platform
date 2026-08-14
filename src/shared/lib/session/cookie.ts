import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  const secret = process.env.SESSION_SECRET as string;
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function signSession(studentId: string): string {
  const payload = base64url(JSON.stringify({ studentId, iat: Date.now() }));
  return `${payload}.${sign(payload)}`;
}

// Returns the studentId if the cookie is well-formed and the signature
// matches, otherwise null (missing cookie, tampered value, bad secret).
export function verifySession(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const { studentId } = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    );
    return typeof studentId === "string" ? studentId : null;
  } catch {
    return null;
  }
}
