/**
 * Performance optimization utilities
 */

/**
 * Creates a memoized version of a function
 *
 * @param fn - Function to memoize
 * @param getKey - Function to generate a cache key from arguments
 * @returns Memoized function
 */
/**
 * Creates a memoized version of a function
 *
 * @template T - Function type
 * @param fn - Function to memoize
 * @param getKey - Function to generate a cache key from arguments
 * @returns Memoized function
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  getKey: (...args: Parameters<T>) => string = (...args) => JSON.stringify(args)
): T & { clearCache: () => void } {
  const cache: Map<string, ReturnType<T>> = new Map<string, ReturnType<T>>();

  /**
   * The memoized function
   * @param args - Arguments to pass to the original function
   * @returns Result from cache or from calling the original function
   */
  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    const key: string = getKey(...args);

    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }

    const result: ReturnType<T> = fn(...args);
    cache.set(key, result);
    return result;
  }) as T & { clearCache: () => void };

  // Add a method to clear the cache
  memoized.clearCache = () => {
    cache.clear();
  };

  return memoized;
}

/**
 * Creates a function that is only called once
 *
 * @param fn - Function to call once
 * @returns Function that only executes once
 */
/**
 * Creates a function that is only called once
 *
 * @template T - Function type
 * @param fn - Function to call once
 * @returns Function that only executes once
 */
export function once<T extends (...args: unknown[]) => unknown>(fn: T): T {
  let called = false;
  let result: ReturnType<T>;

  return ((...args: Parameters<T>): ReturnType<T> => {
    if (!called) {
      result = fn(...args);
      called = true;
    }
    return result;
  }) as T;
}

/**
 * Creates a function that is rate-limited
 *
 * @param fn - Function to rate limit
 * @param limit - Maximum number of calls per interval
 * @param interval - Interval in milliseconds
 * @returns Rate-limited function
 */
/**
 * Creates a function that is rate-limited
 *
 * @template T - Function type
 * @param fn - Function to rate limit
 * @param limit - Maximum number of calls per interval
 * @param interval - Interval in milliseconds
 * @returns Rate-limited function
 */
export function rateLimit<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
  interval: number
): T {
  let calls: number = 0;
  let lastReset: number = Date.now();

  /**
   * The rate-limited function
   * @param args - Arguments to pass to the original function
   * @returns Result from calling the original function or undefined if rate limit exceeded
   */
  return ((...args: Parameters<T>): ReturnType<T> | undefined => {
    const now: number = Date.now();

    // Reset counter if interval has passed
    if (now - lastReset > interval) {
      calls = 0;
      lastReset = now;
    }

    // Check if we've exceeded the limit
    if (calls >= limit) {
      console.warn(`Rate limit exceeded: ${limit} calls per ${interval}ms`);
      return undefined;
    }

    // Increment counter and call function
    calls++;
    return fn(...args);
  }) as T;
}

/**
 * Creates a function that batches multiple calls into a single call
 *
 * @param fn - Function to batch
 * @param delay - Delay in milliseconds
 * @returns Batched function
 */
/**
 * Creates a function that batches multiple calls into a single call
 *
 * @template T - Function type
 * @param fn - Function to batch
 * @param delay - Delay in milliseconds
 * @returns Batched function
 */
export function batch<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timer: NodeJS.Timeout | null = null;
  let batched: Parameters<T>[] = [];

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      // Add to batch
      batched.push(args);

      // Clear existing timer
      if (timer) {
        clearTimeout(timer);
      }

      // Set new timer
      timer = setTimeout(() => {
        const currentBatch = [...batched];
        batched = [];
        timer = null;

        try {
          // Call function with batched arguments
          const result = fn(...currentBatch[0]);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}

/**
 * Creates a function that caches results for a specified time
 *
 * @param fn - Function to cache
 * @param ttl - Time to live in milliseconds
 * @param getKey - Function to generate a cache key from arguments
 * @returns Cached function
 */
/**
 * Creates a function that caches results for a specified time
 *
 * @template T - Function type
 * @param fn - Function to cache
 * @param ttl - Time to live in milliseconds
 * @param getKey - Function to generate a cache key from arguments
 * @returns Cached function
 */
export function cache<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ttl: number,
  getKey: (...args: Parameters<T>) => string = (...args) => JSON.stringify(args)
): T & { clearCache: () => void } {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();

  // Create the cached function
  const cached = ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey(...args);
    const now = Date.now();

    // Check if we have a valid cached value
    if (cache.has(key)) {
      const cachedItem = cache.get(key)!;
      if (now - cachedItem.timestamp < ttl) {
        return cachedItem.value;
      }
    }

    // Call function and cache result
    const result = fn(...args);
    cache.set(key, { value: result, timestamp: now });
    return result;
  }) as T & { clearCache: () => void };

  // Add a method to clear the cache
  cached.clearCache = () => {
    cache.clear();
  };

  return cached;
}
