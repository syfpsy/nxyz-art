import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifyCredentials,
} from "@/lib/auth";
import { identityFromRequest, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { email?: unknown; password?: unknown };

// 10 login attempts per IP per 10-minute window. Generous enough that a
// forgetful admin on a shared office IP won't trip it during a password
// manager fumble, tight enough that a script loop gets stopped cold.
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

/**
 * Admin login. Issues an HMAC-signed session cookie on valid credentials.
 *
 * A 250ms minimum response time masks any per-branch timing differences
 * between "user not found" and "bad password" — not strictly necessary
 * with constant-time compare, but belt-and-braces for a public endpoint.
 */
export async function POST(request: Request) {
  const started = Date.now();

  const identity = identityFromRequest(request);
  const rl = rateLimit("admin-login", identity, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!rl.ok) {
    await delayTo(started, 250);
    const res = NextResponse.json(
      {
        ok: false,
        error: "Too many attempts. Try again in a few minutes.",
      },
      { status: 429 },
    );
    res.headers.set("Retry-After", String(rl.retryAfterSec));
    return res;
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    await delayTo(started, 250);
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  let ok = false;
  try {
    ok = verifyCredentials(email, password);
  } catch (err) {
    console.error("[admin/login] credential check failed", err);
  }

  if (!ok) {
    await delayTo(started, 250);
    return NextResponse.json(
      { ok: false, error: "Wrong email or password." },
      { status: 401 },
    );
  }

  let token: string;
  try {
    token = signSession(email.trim().toLowerCase());
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: `Server missing SESSION_SECRET: ${(err as Error).message}`,
      },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}

async function delayTo(started: number, ms: number) {
  const left = ms - (Date.now() - started);
  if (left > 0) await new Promise((r) => setTimeout(r, left));
}
