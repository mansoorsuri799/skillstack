type CacheEntry<T> = { value: T; expiresAt: number };

const store = new Map<string, CacheEntry<unknown>>();

/** Default TTL for expensive Labs / Ads responses (45 minutes). */
export const DATAFORSEO_CACHE_TTL_MS = 45 * 60 * 1000;

/** Short in-memory TTL cache for DataForSEO dashboard responses. */
export function getCached<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return null;
  }
  return hit.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number = DATAFORSEO_CACHE_TTL_MS) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheKey(parts: Array<string | number | boolean | null | undefined>) {
  return parts.map((p) => String(p ?? "")).join("|");
}
