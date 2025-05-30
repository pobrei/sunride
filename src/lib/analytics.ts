/**
 * Analytics and performance monitoring utilities
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

// Types for analytics events
interface AnalyticsEvent {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

interface CustomEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

/**
 * Send analytics data to monitoring service
 */
function sendToAnalytics(event: AnalyticsEvent | CustomEvent) {
  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', event);
    return;
  }

  // Send to your analytics service (Google Analytics, PostHog, etc.)
  if (typeof window !== 'undefined' && window.gtag) {
    if ('name' in event) {
      // Web Vitals event
      window.gtag('event', event.name, {
        event_category: 'Web Vitals',
        value: Math.round(event.value),
        event_label: event.id,
        custom_map: {
          metric_id: 'dimension1',
          metric_value: 'metric1',
          metric_delta: 'metric2',
          metric_rating: 'dimension2',
        },
      });
    } else {
      // Custom event
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }
  }

  // Also send to PostHog if available
  if (typeof window !== 'undefined' && window.posthog) {
    if ('name' in event) {
      window.posthog.capture('web_vital', {
        metric_name: event.name,
        metric_value: event.value,
        metric_rating: event.rating,
        metric_delta: event.delta,
      });
    } else {
      window.posthog.capture(event.action, {
        category: event.category,
        label: event.label,
        value: event.value,
      });
    }
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initWebVitals() {
  // Core Web Vitals (FID replaced with INP in web-vitals v3)
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics); // Interaction to Next Paint (replaces FID)
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

/**
 * Track custom events
 */
export function trackEvent(event: CustomEvent) {
  sendToAnalytics(event);
}

/**
 * Track GPX processing performance
 */
export function trackGPXProcessing(startTime: number, pointCount: number, success: boolean) {
  const duration = performance.now() - startTime;

  trackEvent({
    action: 'gpx_processing',
    category: 'Performance',
    label: success ? 'success' : 'error',
    value: Math.round(duration),
  });

  // Also track point count for analysis
  trackEvent({
    action: 'gpx_points_processed',
    category: 'Usage',
    value: pointCount,
  });
}

/**
 * Track weather API performance
 */
export function trackWeatherAPI(startTime: number, pointCount: number, success: boolean) {
  const duration = performance.now() - startTime;

  trackEvent({
    action: 'weather_api_request',
    category: 'Performance',
    label: success ? 'success' : 'error',
    value: Math.round(duration),
  });

  trackEvent({
    action: 'weather_points_fetched',
    category: 'Usage',
    value: pointCount,
  });
}

/**
 * Track user interactions
 */
export function trackUserInteraction(action: string, label?: string) {
  trackEvent({
    action,
    category: 'User Interaction',
    label,
  });
}

/**
 * Track errors
 */
export function trackError(error: Error, context: string) {
  trackEvent({
    action: 'error',
    category: 'Error',
    label: `${context}: ${error.message}`,
  });
}

/**
 * Performance observer for monitoring long tasks
 */
export function initPerformanceObserver() {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }

  // Monitor long tasks
  try {
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          // Tasks longer than 50ms
          trackEvent({
            action: 'long_task',
            category: 'Performance',
            value: Math.round(entry.duration),
          });
        }
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  } catch {
    // PerformanceObserver not supported
  }
}

/**
 * Monitor memory usage (if available)
 */
export function trackMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return;
  }

  const memory = (
    performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }
  ).memory;

  trackEvent({
    action: 'memory_usage',
    category: 'Performance',
    value: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
  });

  // Track if we're approaching memory limits
  const memoryUsageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
  if (memoryUsageRatio > 0.8) {
    trackEvent({
      action: 'high_memory_usage',
      category: 'Performance',
      value: Math.round(memoryUsageRatio * 100),
    });
  }
}

// Global type declarations for analytics services
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Initialize all performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') {
    return;
  }

  // Initialize Web Vitals
  initWebVitals();

  // Initialize performance observers
  initPerformanceObserver();

  // Track memory usage periodically
  setInterval(trackMemoryUsage, 30000); // Every 30 seconds

  console.log('Performance monitoring initialized');
}
