/** @jest-environment node */

import { rateLimit, resetRateLimit } from "@/app/_lib/rate-limit";

const WINDOW = 60_000;

describe("rateLimit", () => {
  it("allows requests up to the limit", () => {
    const key = "test-allows-up-to-limit";
    let now = 1_000_000;
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(key, 5, WINDOW, now);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4 - i);
      now += 1;
    }
    resetRateLimit(key);
  });

  it("blocks requests after the limit is exceeded", () => {
    const key = "test-blocks-after-limit";
    const now = 2_000_000;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, WINDOW, now + i).allowed).toBe(true);
    }
    const blocked = rateLimit(key, 3, WINDOW, now + 3);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
    resetRateLimit(key);
  });

  it("resets the window after windowMs has elapsed", () => {
    const key = "test-resets-after-window";
    const now = 3_000_000;
    expect(rateLimit(key, 2, WINDOW, now).allowed).toBe(true);
    expect(rateLimit(key, 2, WINDOW, now + 1).allowed).toBe(true);
    expect(rateLimit(key, 2, WINDOW, now + 2).allowed).toBe(false);
    const afterWindow = rateLimit(key, 2, WINDOW, now + WINDOW);
    expect(afterWindow.allowed).toBe(true);
    expect(afterWindow.remaining).toBe(1);
    resetRateLimit(key);
  });

  it("reports retryAfterMs counting down within the window", () => {
    const key = "test-retry-after";
    const now = 4_000_000;
    rateLimit(key, 1, WINDOW, now);
    const blocked = rateLimit(key, 1, WINDOW, now + 10_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(WINDOW - 10_000);
    resetRateLimit(key);
  });

  it("tracks different keys independently", () => {
    const now = 5_000_000;
    expect(rateLimit("key-a", 1, WINDOW, now).allowed).toBe(true);
    expect(rateLimit("key-a", 1, WINDOW, now).allowed).toBe(false);
    expect(rateLimit("key-b", 1, WINDOW, now).allowed).toBe(true);
    resetRateLimit("key-a");
    resetRateLimit("key-b");
  });
});

describe("resetRateLimit", () => {
  it("clears a bucket so requests are allowed again", () => {
    const key = "test-reset-clears";
    const now = 6_000_000;
    expect(rateLimit(key, 1, WINDOW, now).allowed).toBe(true);
    expect(rateLimit(key, 1, WINDOW, now).allowed).toBe(false);
    resetRateLimit(key);
    const afterReset = rateLimit(key, 1, WINDOW, now);
    expect(afterReset.allowed).toBe(true);
    expect(afterReset.remaining).toBe(0);
  });

  it("resetting one key does not affect another", () => {
    const now = 7_000_000;
    rateLimit("keep-me", 1, WINDOW, now);
    rateLimit("drop-me", 1, WINDOW, now);
    expect(rateLimit("drop-me", 1, WINDOW, now).allowed).toBe(false);
    resetRateLimit("drop-me");
    expect(rateLimit("drop-me", 1, WINDOW, now).allowed).toBe(true);
    expect(rateLimit("keep-me", 1, WINDOW, now).allowed).toBe(false);
    resetRateLimit("keep-me");
    resetRateLimit("drop-me");
  });
});
