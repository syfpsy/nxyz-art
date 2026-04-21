import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lightweight session probe used by the /admin UI to decide whether
 * to render the login form or the editor.
 */
export async function GET() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  let session = null;
  try {
    session = verifySession(token);
  } catch {
    session = null;
  }
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    email: session.email,
    exp: session.exp,
    env: process.env.NODE_ENV !== "production" ? "dev" : "prod",
  });
}
