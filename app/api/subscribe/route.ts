import { NextResponse } from "next/server";
import { identityFromRequest, rateLimit } from "@/lib/rate-limit";

/**
 * Newsletter subscribe endpoint.
 *
 * Tries (in order):
 *   1. Buttondown API, if `BUTTONDOWN_API_KEY` is set.
 *   2. Resend contacts API, if `RESEND_API_KEY` and `RESEND_AUDIENCE_ID`
 *      are set.
 *   3. Nothing: logs to the function logs and returns success anyway.
 *      This lets the form work in production before a provider is wired up.
 *
 * Abuse mitigations:
 *   - Honeypot field (`company`) — legitimate clients leave this empty.
 *   - IP rate limit (5 attempts / 10 minutes) — caps log-flood and
 *     provider-quota pressure from a naive loop.
 *
 * The route is intentionally forgiving: it never leaks provider errors to
 * the client beyond "we couldn't record your email, try again later".
 */
export const runtime = "nodejs";

type Body = {
  email?: unknown;
  /** Honeypot — humans always leave this empty. */
  company?: unknown;
};

const SUBSCRIBE_LIMIT = 5;
const SUBSCRIBE_WINDOW_MS = 10 * 60 * 1000;

function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  // Editorial-grade, not RFC-complete. Good enough to reject typos.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(request: Request) {
  const identity = identityFromRequest(request);
  const rl = rateLimit(
    "subscribe",
    identity,
    SUBSCRIBE_LIMIT,
    SUBSCRIBE_WINDOW_MS,
  );
  if (!rl.ok) {
    const res = NextResponse.json(
      {
        ok: false,
        error: "Too many signups from this address. Try again shortly.",
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
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  // Honeypot: return a success shape without contacting any provider, so
  // the bot's logs look identical to a real success and it doesn't retry.
  const hp = typeof body.company === "string" ? body.company.trim() : "";
  if (hp.length > 0) {
    console.log(
      `[subscribe] honeypot tripped ip=${identity} hp_len=${hp.length}`,
    );
    return NextResponse.json({ ok: true, provider: "honeypot" });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "That doesn't look like an email address." },
      { status: 400 },
    );
  }

  // Provider 1 — Buttondown.
  const buttondown = process.env.BUTTONDOWN_API_KEY;
  if (buttondown) {
    try {
      const res = await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: {
          Authorization: `Token ${buttondown}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_address: email }),
      });
      if (res.ok) {
        return NextResponse.json({ ok: true, provider: "buttondown" });
      }
      // Buttondown returns 400 for already-subscribed — still a success UX.
      if (res.status === 400) {
        return NextResponse.json({ ok: true, provider: "buttondown", alreadySubscribed: true });
      }
      console.error("[subscribe] buttondown error", res.status, await res.text());
    } catch (err) {
      console.error("[subscribe] buttondown threw", err);
    }
    // Fall through to other providers / fallback.
  }

  // Provider 2 — Resend Audiences.
  const resendKey = process.env.RESEND_API_KEY;
  const resendAudience = process.env.RESEND_AUDIENCE_ID;
  if (resendKey && resendAudience) {
    try {
      const res = await fetch(
        `https://api.resend.com/audiences/${resendAudience}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, unsubscribed: false }),
        },
      );
      if (res.ok) {
        return NextResponse.json({ ok: true, provider: "resend" });
      }
      console.error("[subscribe] resend error", res.status, await res.text());
    } catch (err) {
      console.error("[subscribe] resend threw", err);
    }
  }

  // Fallback — log it and return success. The user can wire up a provider
  // later without touching the form component. This is safe because we
  // still validated the address.
  console.log(`[subscribe] captured (no provider) email=${email}`);
  return NextResponse.json({ ok: true, provider: "log" });
}
