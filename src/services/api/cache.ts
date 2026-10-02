/**
 * Production-Grade In-Memory API Cache & In-Flight Request Deduplicator
 *
 * Eliminates redundant network calls, prevents connection saturation,
 * and provides sub-millisecond (0ms) response times for cached endpoints
 * with Stale-While-Revalidate (SWR) fallback support.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class ApiCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();
  private maxEntries = 500;

  /**
   * Generates a normalized cache key
   */
  public makeKey(prefix: string, params?: Record<string, any> | string | number): string {
    if (params === undefined || params === null) {
      return prefix;
    }
    if (typeof params === 'string' || typeof params === 'number') {
      return `${prefix}:${params}`;
    }
    const sorted = Object.keys(params)
      .sort()
      .filter((k) => params[k] !== undefined && params[k] !== null)
      .map((k) => `${k}=${params[k]}`)
      .join('&');
    return `${prefix}?${sorted}`;
  }

  /**
   * Synchronously checks if a fresh cache entry exists
   */
  public get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttlMs) {
      return undefined; // Expired for fresh lookups, but preserved in cache for getStale()
    }
    return entry.data as T;
  }

  /**
   * Returns cached data even if it has exceeded its TTL (stale fallback for errors/timeouts)
   */
  public getStale<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    return entry ? (entry.data as T) : undefined;
  }

  /**
   * Stores data in cache with specified TTL in milliseconds
   */
  public set<T>(key: string, data: T, ttlMs: number): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest entries
      const oldestKeys = Array.from(this.cache.keys()).slice(0, 50);
      oldestKeys.forEach((k) => this.cache.delete(k));
    }
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
    });
  }

  /**
   * Invalidates a single key or all keys matching a prefix
   */
  public invalidate(prefixOrKey: string): void {
    for (const key of Array.from(this.cache.keys())) {
      if (key === prefixOrKey || key.startsWith(`${prefixOrKey}:`)) {
        this.cache.delete(key);
      }
    }
    for (const key of Array.from(this.inFlight.keys())) {
      if (key === prefixOrKey || key.startsWith(`${prefixOrKey}:`)) {
        this.inFlight.delete(key);
      }
    }
  }

  /**
   * Fetches data with automatic in-flight deduplication and caching.
   * If an identical request is already pending, it joins the existing Promise.
   * If fresh data exists in cache, it returns immediately without network hit.
   * If network fails or times out, falls back to stale cache if available.
   */
  public async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number,
    options?: {
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    // 1. Return fresh cached data if available and not forced
    if (!options?.forceRefresh) {
      const cached = this.get<T>(key);
      if (cached !== undefined) {
        return cached;
      }
    }

    // 2. In-flight request deduplication: reuse running promise if already in flight
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
    }

    // 3. Initiate fetch and register in flight
    const promise = (async () => {
      try {
        const data = await fetcher();
        if (data !== undefined && data !== null) {
          this.set(key, data, ttlMs);
        }
        return data;
      } catch (err) {
        // Stale fallback: if network failed, check if we have any stale cached data
        const stale = this.getStale<T>(key);
        if (stale !== undefined) {
          console.warn(`[ApiCache] Network fetch failed for ${key}, returning stale cache fallback:`, err);
          return stale;
        }
        throw err;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }
}

export const apiCache = new ApiCacheManager();
