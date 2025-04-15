/**
 * GPX processing service using Web Workers
 * Offloads CPU-intensive calculations to a background thread
 */

import { GPXPoint, ForecastPoint, GPXElevation, WorkerRequest, WorkerResponse } from '@shared/types';

export class GPXProcessor {
  private worker: Worker | null;

  constructor() {
    this.worker = null;
    this.initWorker();
  }

  private initWorker(): void {
    if (typeof window === 'undefined') return; // Server-side guard

    // Create worker only in browser environment
    if (window.Worker) {
      this.worker = new Worker(new URL('../workers/gpxWorker.js', import.meta.url));
    } else {
      console.warn('Web Workers not supported, calculations will run on main thread');
    }
  }

  /**
   * Process GPX data with or without Web Worker
   * @param points - Array of track points
   * @param settings - Processing settings
   * @returns Promise resolving to processing results
   */
  processGPXData(points: GPXPoint[], settings: { forecastInterval?: number; averageSpeed?: number }): Promise<WorkerResponse> {
    // If worker is available, use it
    if (this.worker) {
      return new Promise<WorkerResponse>((resolve, reject) => {
        // Set up one-time response handler
        const responseHandler = (event: MessageEvent<WorkerResponse>): void => {
          if (this.worker) {
            this.worker.removeEventListener('message', responseHandler);
          }

          if (event.data.success) {
            resolve(event.data);
          } else {
            reject(new Error(event.data.error || 'GPX processing failed'));
          }
        };

        // Listen for response
        this.worker.addEventListener('message', responseHandler);

        // Send data to worker
        const request: WorkerRequest = { points, settings };
        this.worker.postMessage(request);
      });
    } else {
      // Fallback to synchronous processing
      return this.processGPXDataSync(points, settings);
    }
  }

  /**
   * Synchronous processing fallback
   * Used when Web Workers are not available
   */
  private processGPXDataSync(points: GPXPoint[], settings: { forecastInterval?: number; averageSpeed?: number }): Promise<WorkerResponse> {
    try {
      // Calculate total distance
      let totalDistance = 0;
      for (let i = 1; i < points.length; i++) {
        totalDistance += this.calculateDistance(points[i - 1], points[i]);
      }

      // Calculate elevation statistics
      const elevation = this.calculateElevation(points);

      // Calculate forecast points
      const forecastInterval = settings.forecastInterval || 5; // Default 5km intervals
      const forecastPoints = this.calculateForecastPoints(points, forecastInterval);

      // Calculate estimated duration
      const averageSpeed = settings.averageSpeed || 20; // Default 20km/h
      const estimatedDuration = totalDistance / averageSpeed;

      return Promise.resolve({
        success: true,
        totalDistance,
        elevation,
        forecastPoints,
        estimatedDuration,
        stats: {
          pointCount: points.length,
          forecastPointCount: forecastPoints.length,
        },
      });
    } catch (error) {
      return Promise.reject(new Error(`GPX processing failed: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  // Helper methods (duplicated from worker for fallback)
  private calculateDistance(point1: GPXPoint, point2: GPXPoint): number {
    const toRad = (value: number): number => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(point2.lat - point1.lat);
    const dLon = toRad(point2.lon - point1.lon);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(point1.lat)) *
        Math.cos(toRad(point2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private calculateElevation(points: GPXPoint[]): GPXElevation {
    let gain = 0;
    let loss = 0;
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    let sum = 0;

    for (let i = 0; i < points.length; i++) {
      const ele = points[i].ele ?? 0;
      min = Math.min(min, ele);
      max = Math.max(max, ele);
      sum += ele;

      if (i > 0) {
        const prevEle = points[i - 1].ele ?? 0;
        const diff = ele - prevEle;
        if (diff > 0) {
          gain += diff;
        } else {
          loss += Math.abs(diff);
        }
      }
    }

    const avg = points.length > 0 ? sum / points.length : 0;

    return { gain, loss, min, max, avg };
  }

  private calculateForecastPoints(points: GPXPoint[], interval: number): ForecastPoint[] {
    const forecastPoints: ForecastPoint[] = [
      {
        lat: points[0].lat,
        lon: points[0].lon,
        distance: 0,
        elevation: points[0].ele,
        index: 0
      }
    ]; // Always include start point
    let accumulatedDistance = 0;
    let totalDistance = 0;

    for (let i = 1; i < points.length; i++) {
      const segmentDistance = this.calculateDistance(points[i - 1], points[i]);
      accumulatedDistance += segmentDistance;
      totalDistance += segmentDistance;

      if (accumulatedDistance >= interval) {
        forecastPoints.push({
          lat: points[i].lat,
          lon: points[i].lon,
          distance: totalDistance,
          elevation: points[i].ele,
          index: i
        });
        accumulatedDistance = 0; // Reset accumulated distance
      }
    }

    // Always include end point
    const lastPoint = points[points.length - 1];
    const lastForecastPoint = forecastPoints[forecastPoints.length - 1];

    if (lastForecastPoint.lat !== lastPoint.lat || lastForecastPoint.lon !== lastPoint.lon) {
      forecastPoints.push({
        lat: lastPoint.lat,
        lon: lastPoint.lon,
        distance: totalDistance,
        elevation: lastPoint.ele,
        index: points.length - 1
      });
    }

    return forecastPoints;
  }
}
