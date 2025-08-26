import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache duration constants (in seconds)
export const CACHE_DURATIONS = {
  MOVIE_DETAILS: 24 * 60 * 60, // 24 hours
  POPULAR_MOVIES: 6 * 60 * 60, // 6 hours
  TOP_RATED: 12 * 60 * 60, // 12 hours
  GENRES: 7 * 24 * 60 * 60, // 7 days (rarely change)
  SEARCH_RESULTS: 30 * 60, // 30 minutes
  RECOMMENDATIONS: 2 * 60 * 60, // 2 hours
  SIMILAR_MOVIES: 24 * 60 * 60, // 24 hours
} as const;

// Helper function to generate cache keys
export const generateCacheKey = (prefix: string, params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `${prefix}:${sortedParams}`;
};

// Generic cache wrapper function
export const withCache = async <T>(
  cacheKey: string,
  fetchFunction: () => Promise<T>,
  duration: number = CACHE_DURATIONS.RECOMMENDATIONS
): Promise<T> => {
  try {
    // Try to get from cache first
    const cached = await redis.get<T>(cacheKey);
    if (cached !== null) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return cached;
    }

    // If not in cache, fetch fresh data
    console.log(`[CACHE MISS] ${cacheKey}`);
    const freshData = await fetchFunction();
    
    // Store in cache with expiration
    await redis.setex(cacheKey, duration, freshData);
    
    return freshData;
  } catch (error) {
    console.error(`[CACHE ERROR] ${cacheKey}:`, error);
    // Fallback to direct API call if cache fails
    return await fetchFunction();
  }
};

// Function to invalidate cache by pattern
export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[CACHE INVALIDATED] ${keys.length} keys matching ${pattern}`);
    }
  } catch (error) {
    console.error(`[CACHE INVALIDATION ERROR] ${pattern}:`, error);
  }
};

export default redis;