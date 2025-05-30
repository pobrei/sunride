'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Generic progressive loading hook
 * Manages loading states with progressive enhancement
 */
export function useProgressiveLoading<T>(
  loadingFunction: () => Promise<T>,
  dependencies: unknown[] = [],
  options: {
    immediate?: boolean;
    retryCount?: number;
    retryDelay?: number;
  } = {}
) {
  const { immediate = false, retryCount = 3, retryDelay = 1000 } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  const [retries, setRetries] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await loadingFunction();
      
      clearInterval(progressInterval);
      setProgress(100);
      setData(result);
      setRetries(0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      if (retries < retryCount) {
        setRetries(prev => prev + 1);
        setTimeout(() => load(), retryDelay);
      } else {
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [loadingFunction, retries, retryCount, retryDelay]);

  useEffect(() => {
    if (immediate) {
      load();
    }
  }, [immediate, ...dependencies]);

  const retry = useCallback(() => {
    setRetries(0);
    load();
  }, [load]);

  return {
    data,
    loading,
    error,
    progress,
    retries,
    load,
    retry,
  };
}

/**
 * Progressive loading hook specifically for weather data
 */
export function useProgressiveWeatherLoading(points: { lat: number; lon: number }[]) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [weatherData, setWeatherData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadWeatherData = useCallback(async () => {
    if (points.length === 0) return;

    setLoading(true);
    setError(null);
    setLoadedCount(0);
    setWeatherData([]);

    try {
      // Load weather data progressively in batches
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < points.length; i += batchSize) {
        batches.push(points.slice(i, i + batchSize));
      }

      const allData: unknown[] = [];

      for (const batch of batches) {
        // Simulate API calls for each batch
        const batchPromises = batch.map(async (point) => {
          // Replace with actual weather API call
          await new Promise(resolve => setTimeout(resolve, 200));
          return { lat: point.lat, lon: point.lon, temp: 20, humidity: 60 };
        });

        const batchResults = await Promise.all(batchPromises);
        allData.push(...batchResults);
        
        setLoadedCount(allData.length);
        setWeatherData([...allData]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load weather data'));
    } finally {
      setLoading(false);
    }
  }, [points]);

  const progress = useMemo(() => {
    return points.length > 0 ? (loadedCount / points.length) * 100 : 0;
  }, [loadedCount, points.length]);

  return {
    weatherData,
    loading,
    error,
    progress,
    loadedCount,
    totalCount: points.length,
    loadWeatherData,
  };
}

/**
 * Progressive loading hook for chart rendering
 */
export function useProgressiveChartLoading(data: unknown[], chunkSize = 100) {
  const [renderedData, setRenderedData] = useState<unknown[]>([]);
  const [rendering, setRendering] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(0);

  const renderProgressively = useCallback(async () => {
    if (data.length === 0) return;

    setRendering(true);
    setRenderedData([]);
    setCurrentChunk(0);

    const chunks = Math.ceil(data.length / chunkSize);

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);
      const chunk = data.slice(start, end);

      // Render chunk with a small delay for smooth animation
      await new Promise(resolve => setTimeout(resolve, 50));
      
      setRenderedData(prev => [...prev, ...chunk]);
      setCurrentChunk(i + 1);
    }

    setRendering(false);
  }, [data, chunkSize]);

  const progress = useMemo(() => {
    const totalChunks = Math.ceil(data.length / chunkSize);
    return totalChunks > 0 ? (currentChunk / totalChunks) * 100 : 0;
  }, [currentChunk, data.length, chunkSize]);

  useEffect(() => {
    if (data.length > 0) {
      renderProgressively();
    }
  }, [data, renderProgressively]);

  return {
    renderedData,
    rendering,
    progress,
    currentChunk,
    totalChunks: Math.ceil(data.length / chunkSize),
  };
}

/**
 * Progressive loading hook for timeline components
 */
export function useProgressiveTimelineLoading(events: unknown[], delay = 100) {
  const [visibleEvents, setVisibleEvents] = useState<unknown[]>([]);
  const [animating, setAnimating] = useState(false);

  const animateTimeline = useCallback(async () => {
    if (events.length === 0) return;

    setAnimating(true);
    setVisibleEvents([]);

    for (let i = 0; i < events.length; i++) {
      await new Promise(resolve => setTimeout(resolve, delay));
      setVisibleEvents(prev => [...prev, events[i]]);
    }

    setAnimating(false);
  }, [events, delay]);

  useEffect(() => {
    if (events.length > 0) {
      animateTimeline();
    }
  }, [events, animateTimeline]);

  const progress = useMemo(() => {
    return events.length > 0 ? (visibleEvents.length / events.length) * 100 : 0;
  }, [visibleEvents.length, events.length]);

  return {
    visibleEvents,
    animating,
    progress,
    animateTimeline,
  };
}
