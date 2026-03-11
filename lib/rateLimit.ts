const requests = new Map<string, { count: number; resetAt: number }>();

const MAX_REQUESTS = 20; // per window
const WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Simple in-memory rate limiter by IP.
 * Returns { allowed: true } or { allowed: false, retryAfterMs }.
 */
export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = requests.get(ip);

  // Clean up expired entries periodically
  if (requests.size > 10000) {
    for (const [key, val] of requests) {
      if (now > val.resetAt) requests.delete(key);
    }
  }

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true };
}
