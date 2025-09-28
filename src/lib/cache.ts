// Simple in-memory cache for API responses
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Clear cache entries that match a pattern
  clearPattern(pattern: string) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new MemoryCache();

// Cache keys
export const CACHE_KEYS = {
  CHALLENGES: 'challenges',
  CATEGORIES: 'categories',
  LEADERBOARD: 'leaderboard',
  TEAMS: 'teams',
  USERS: 'users',
  CONFIG: 'config',
  ANNOUNCEMENTS: 'announcements',
  ACTIVITY: 'activity'
} as const;

