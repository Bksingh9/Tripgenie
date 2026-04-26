import { describe, it, expect, beforeEach } from "vitest";
import { _resetRateLimit, rateLimit } from "./_rateLimit";

describe("rateLimit", () => {
  beforeEach(() => _resetRateLimit());

  it("allows requests under the limit", () => {
    for (let i = 0; i < 5; i++) {
      const r = rateLimit("ip-1", 5, 60_000, 1000);
      expect(r.ok).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit", () => {
    for (let i = 0; i < 3; i++) rateLimit("ip-1", 3, 60_000, 1000);
    const r = rateLimit("ip-1", 3, 60_000, 1000);
    expect(r.ok).toBe(false);
    expect(r.remaining).toBe(0);
    expect(r.retryAfter).toBeGreaterThan(0);
  });

  it("recovers after the window slides past the oldest stamp", () => {
    for (let i = 0; i < 3; i++) rateLimit("ip-1", 3, 60_000, 1000);
    expect(rateLimit("ip-1", 3, 60_000, 1500).ok).toBe(false);
    // 60s + 1ms after the first stamp at t=1000 → first stamp falls out
    expect(rateLimit("ip-1", 3, 60_000, 61_001).ok).toBe(true);
  });

  it("buckets are independent per key", () => {
    for (let i = 0; i < 3; i++) rateLimit("ip-1", 3, 60_000, 1000);
    expect(rateLimit("ip-1", 3, 60_000, 1000).ok).toBe(false);
    expect(rateLimit("ip-2", 3, 60_000, 1000).ok).toBe(true);
  });

  it("retryAfter is at least 1 second when limited", () => {
    for (let i = 0; i < 3; i++) rateLimit("ip-1", 3, 60_000, 1000);
    const r = rateLimit("ip-1", 3, 60_000, 59_999);
    expect(r.ok).toBe(false);
    expect(r.retryAfter).toBeGreaterThanOrEqual(1);
  });
});
