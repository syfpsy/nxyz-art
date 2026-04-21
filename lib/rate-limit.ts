/**
 * Tiny in-memory fixed-window rate limiter.
 *
 * Vercel's serverless runtime re-uses warm function instances for short
 * bursts, which is enough to dampen a brute-force or spam flood. It is NOT
 * durable across cold starts or regions — if we ever need that we'll swap
 * to Upstash / KV. For now it's a pragmatic shield for low-volume
 * endpoints (login, subscribe) that don't have a managed abuse story yet.
 *
 * Each bucket is keyed by `scope + identity` (usually IP). The limiter
 * returns structured info so callers can log and set `Retry-After`.
 */

type Entry = {
  /** Unix ms when the current window started. */
  windowStart: number;
  /** Number of hits recorded in the current window. */
  count: number;
};

type Buckets = Map<string, Entry>;

// One globally-scoped bucket map, shared across module evaluations in a
// warm lambda. `globalThis` makes it survive Next.js dev HMR too.
const GLOBAL_KEY = Symbol.for("nxyz.rate-limit.buckets");
type Globally = typeof globalThis & { [GLOBAL_KEY]?: Buckets };
function getBuckets(): Buckets {
  const g = globalThis as Globally;
  if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = new Map();
  return g[GLOBAL_KEY]!;
}

export type RateLimitResult = {
  /** True if the hit is allowed (under the limit). */
  ok: boolean;
  /** Calls remaining in the current window after this hit. */
  remaining: number;
  /** Seconds until the bucket resets. */
  retryAfterSec: number;
  /** Unix ms when the window resets. */
  resetAt: number;
};

/**
 * Record a hit and report whether it's under the limit.
 *
 * @param scope     Short name for the endpoint (e.g. "login"). Keeps
 *                  buckets disjoint so a spam burst on one route doesn't
 *                  push a legitimate user over on another.
 * @param identity  Stable identity string, typically the client IP. Fall
 *                  back to "anonymous" if unknown.
 * @param limit     Max hits allowed per window.
 * @param windowMs  Window length in milliseconds.
 */
export function rateLimit(
  scope: string,
  identity: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const buckets = getBuckets();
  const key = `${scope}:${identity}`;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    // New window.
    buckets.set(key, { windowStart: now, count: 1 });
    return {
      ok: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSec: Math.ceil(windowMs / 1000),
      resetAt: now + windowMs,
    };
  }

  existing.count += 1;
  const resetAt = existing.windowStart + windowMs;
  const remaining = Math.max(0, limit - existing.count);
  const retryAfterSec = Math.max(1, Math.ceil((resetAt - now) / 1000));
  const ok = existing.count <= limit;

  // Occasionally prune entries older than two windows so the map can't
  // grow unbounded on a long-lived warm instance. Runs ~1/50 calls to
  // avoid burning cycles on the common path.
  if (Math.random() < 0.02) {
    const cutoff = now - windowMs * 2;
    for (const [k, v] of buckets) {
      if (v.windowStart < cutoff) buckets.delete(k);
    }
  }

  return { ok, remaining, retryAfterSec, resetAt };
}

/**
 * Extract a stable-ish client identity from a Next.js request. Prefers
 * Vercel's forwarded IP headers, then falls back to a remote-addr proxy,
 * then to "anonymous" so the limiter never throws.
 */
export function identityFromRequest(req: Request): string {
  const h = req.headers;
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  const vercel = h.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0]!.trim();
  return "anonymous";
}
