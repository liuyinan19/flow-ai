/**
 * Per-IP, per-route token-bucket rate limit.
 *
 * Lives in process memory — so it resets on every cold start and isn't shared
 * across Vercel serverless invocations. That's fine for the portfolio demo: it
 * caps a single recruiter's accidental F5-spam from a hot instance, which is
 * the only real failure mode here. In a real production system this would be
 * Upstash Redis, Cloudflare, or Vercel KV behind the same interface.
 */

interface Bucket {
  /** Tokens currently available. */
  tokens: number;
  /** Last refill timestamp (ms). */
  refilledAt: number;
}

const BUCKETS = new Map<string, Bucket>();

export interface RateLimitConfig {
  /** Bucket capacity — max burst. */
  capacity: number;
  /** Tokens refilled per second. */
  refillPerSecond: number;
}

export const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  // Analyze + demo are the expensive endpoints — they call the LLM.
  analyze: { capacity: 8, refillPerSecond: 8 / 60 }, // 8 burst, ~8/min sustained
  demo: { capacity: 4, refillPerSecond: 4 / 60 }, // 4 burst, ~4/min sustained
  evaluations: { capacity: 4, refillPerSecond: 4 / 60 },
  // Edits and status flips are cheap but a runaway client could still hammer.
  default: { capacity: 30, refillPerSecond: 30 / 60 },
};

export function rateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  let bucket = BUCKETS.get(key);
  if (!bucket) {
    bucket = { tokens: config.capacity, refilledAt: now };
    BUCKETS.set(key, bucket);
  } else {
    const elapsedSec = (now - bucket.refilledAt) / 1000;
    bucket.tokens = Math.min(
      config.capacity,
      bucket.tokens + elapsedSec * config.refillPerSecond,
    );
    bucket.refilledAt = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true };
  }

  const deficit = 1 - bucket.tokens;
  const retryAfterSec = Math.ceil(deficit / config.refillPerSecond);
  return { allowed: false, retryAfterSec };
}

/** Best-effort client IP from common Vercel / proxy headers. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "anonymous";
}

export function makeRateLimitResponse(retryAfterSec: number): Response {
  return new Response(
    JSON.stringify({
      error: `Rate limit reached. Try again in ${retryAfterSec} second${retryAfterSec === 1 ? "" : "s"}.`,
      retryAfter: retryAfterSec,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    },
  );
}
