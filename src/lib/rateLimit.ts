interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

setInterval(() => {
  const now = Date.now();
  store.forEach((win, key) => {
    if (now > win.resetAt) store.delete(key);
  });
}, 5 * 60 * 1000);

/**
 * Returns true if the request is within the limit, false if it should be blocked.
 */
export function rateLimit(key: string, limit: number, windowSeconds: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count += 1;
  return true;
}
