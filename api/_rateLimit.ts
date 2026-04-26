// Sliding-window in-memory rate limiter, scoped per Vercel instance. Good
// enough to protect the free Amadeus quota (10 TPS, 10K/month) from a
// runaway client; not a substitute for an edge KV store at higher scale.

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX = 60;

const buckets = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter?: number;
}

export function rateLimit(
  key: string,
  max = DEFAULT_MAX,
  windowMs = DEFAULT_WINDOW_MS,
  now = Date.now(),
): RateLimitResult {
  const stamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (stamps.length >= max) {
    const oldest = stamps[0];
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    buckets.set(key, stamps);
    return { ok: false, remaining: 0, retryAfter };
  }
  stamps.push(now);
  buckets.set(key, stamps);

  // Cheap opportunistic cleanup so the Map doesn't grow unbounded across
  // weeks of unique IPs on a long-warm instance.
  if (buckets.size > 1000 && Math.random() < 0.05) {
    for (const [k, ts] of buckets) {
      const fresh = ts.filter((t) => now - t < windowMs);
      if (fresh.length === 0) buckets.delete(k);
      else if (fresh.length !== ts.length) buckets.set(k, fresh);
    }
  }

  return { ok: true, remaining: max - stamps.length };
}

// For tests only.
export function _resetRateLimit() {
  buckets.clear();
}
