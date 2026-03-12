const minuteBuckets = new Map<string, { count: number; resetAt: number }>();
const dailyBuckets = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_MAX_PER_MINUTE = 20;
const WINDOW_MS = 60 * 1000; // 1 minute
const DAY_MS = 24 * 60 * 60 * 1000;

interface RateLimitOptions {
  maxPerMinute?: number;
  maxPerDay?: number;
}

/**
 * In-memory rate limiter by key (typically IP or IP:endpoint).
 * Supports per-minute and optional per-day caps.
 */
export function checkRateLimit(
  key: string,
  options?: RateLimitOptions
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const maxPerMinute = options?.maxPerMinute ?? DEFAULT_MAX_PER_MINUTE;
  const maxPerDay = options?.maxPerDay;

  // Clean up expired entries periodically
  if (minuteBuckets.size > 10000) {
    for (const [k, val] of minuteBuckets) {
      if (now > val.resetAt) minuteBuckets.delete(k);
    }
  }
  if (dailyBuckets.size > 10000) {
    for (const [k, val] of dailyBuckets) {
      if (now > val.resetAt) dailyBuckets.delete(k);
    }
  }

  // Check daily cap first
  if (maxPerDay) {
    const dailyKey = `${key}:daily`;
    const daily = dailyBuckets.get(dailyKey);

    if (!daily || now > daily.resetAt) {
      dailyBuckets.set(dailyKey, { count: 1, resetAt: now + DAY_MS });
    } else if (daily.count >= maxPerDay) {
      return { allowed: false, retryAfterMs: daily.resetAt - now };
    } else {
      daily.count++;
    }
  }

  // Check per-minute cap
  const entry = minuteBuckets.get(key);

  if (!entry || now > entry.resetAt) {
    minuteBuckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= maxPerMinute) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true };
}
