import crypto from "node:crypto";

/**
 * Admin auth.
 *
 * - Credentials live in env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) — never
 *   in the repo. Comparison is constant-time so timing can't leak.
 * - Sessions are stateless HMAC-signed cookies: `base64url(payload).sig`.
 *   No database, no session store; the `SESSION_SECRET` env var is the
 *   single source of trust.
 *
 * This is intentionally simple — one-admin site, no role graph, no OAuth.
 */

export const SESSION_COOKIE = "nxyz_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type Session = {
  email: string;
  iat: number;
  exp: number;
};

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "SESSION_SECRET is not set (need at least 16 chars). Configure it in the environment.",
    );
  }
  return s;
}

function b64urlEncode(data: Buffer | string): string {
  const buf = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  return buf.toString("base64url");
}

function b64urlDecode(data: string): Buffer {
  return Buffer.from(data, "base64url");
}

export function signSession(email: string): string {
  const iat = Math.floor(Date.now() / 1000);
  const payload: Session = { email, iat, exp: iat + SESSION_MAX_AGE };
  const encoded = b64urlEncode(JSON.stringify(payload));
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifySession(token: string | undefined): Session | null {
  if (!token || typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const encoded = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  let expected: string;
  try {
    expected = crypto
      .createHmac("sha256", getSecret())
      .update(encoded)
      .digest("base64url");
  } catch {
    return null;
  }

  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length) return null;
  let equal = false;
  try {
    equal = crypto.timingSafeEqual(a, b);
  } catch {
    return null;
  }
  if (!equal) return null;

  try {
    const payload = JSON.parse(
      b64urlDecode(encoded).toString("utf8"),
    ) as Session;
    if (
      !payload ||
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  try {
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export function verifyCredentials(email: string, password: string): boolean {
  // Trim env values defensively — CLIs (Vercel's included) sometimes tack on
  // trailing newlines depending on the shell that set them.
  const expEmail = process.env.ADMIN_EMAIL?.trim();
  const expPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!expEmail || !expPassword) return false;
  return (
    timingSafeStringEqual(
      email.trim().toLowerCase(),
      expEmail.toLowerCase(),
    ) && timingSafeStringEqual(password.trim(), expPassword)
  );
}
