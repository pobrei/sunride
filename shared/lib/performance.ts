/**
 * Performance optimization utilities
 */

/**
 * Debounces a function to limit how often it can be called
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function(...args: Parameters<T>): void {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttles a function to limit how often it can be called
 * @param fn Function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return function(...args: Parameters<T>): void {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Creates a memoized version of a function
 * @param fn Function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return function(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  } as T;
}

/**
 * Defers execution of a function until the browser is idle
 * @param fn Function to defer
 * @returns Function that schedules execution during idle time
 */
export function deferUntilIdle<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => void {
  return function(...args: Parameters<T>): void {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => fn(...args));
    } else {
      setTimeout(() => fn(...args), 1);
    }
  };
}

/**
 * Batches multiple function calls into a single call
 * @param fn Function to batch
 * @param delay Delay in milliseconds
 * @returns Batched function
 */
export function batch<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;
  let batched: Parameters<T>[] = [];
  
  return function(...args: Parameters<T>): void {
    batched.push(args);
    
    if (timer) {
      clearTimeout(timer);
    }
    
    timer = setTimeout(() => {
      const args = batched;
      batched = [];
      timer = null;
      fn(...args[0]);
    }, delay);
  };
}

/**
 * Measures the execution time of a function
 * @param fn Function to measure
 * @param label Label for the console output
 * @returns Wrapped function that logs execution time
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  label: string
): (...args: Parameters<T>) => ReturnType<T> {
  return function(...args: Parameters<T>): ReturnType<T> {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    console.log(`${label} took ${end - start}ms`);
    return result;
  };
}

/**
 * Checks if the browser supports a specific feature
 * @param feature Feature to check
 * @returns Whether the feature is supported
 */
export function supportsFeature(feature: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  switch (feature) {
    case 'intersectionObserver':
      return 'IntersectionObserver' in window;
    case 'resizeObserver':
      return 'ResizeObserver' in window;
    case 'mutationObserver':
      return 'MutationObserver' in window;
    case 'webp':
      return document.createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0;
    case 'avif':
      return document.createElement('canvas')
        .toDataURL('image/avif')
        .indexOf('data:image/avif') === 0;
    case 'webgl':
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    case 'webgl2':
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
      } catch (e) {
        return false;
      }
    case 'webworker':
      return 'Worker' in window;
    case 'sharedworker':
      return 'SharedWorker' in window;
    case 'serviceworker':
      return 'serviceWorker' in navigator;
    default:
      return false;
  }
}
