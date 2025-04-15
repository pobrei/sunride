/**
 * Web Worker for CPU-intensive GPX file processing
 * This moves calculations off the main thread to prevent UI freezing
 */

import { GPXPoint, ForecastPoint, GPXElevation, WorkerRequest, WorkerResponse } from '@shared/types';

// Need to declare self for TypeScript in a worker context
declare const self: Worker;

// Calculate distance between two points using Haversine formula
const calculateDistance = (point1: GPXPoint, point2: GPXPoint): number => {
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
};

// Calculate total elevation gain/loss
const calculateElevation = (points: GPXPoint[]): GPXElevation => {
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
};

// Calculate weather forecast points along the route
const calculateForecastPoints = (points: GPXPoint[], interval: number): ForecastPoint[] => {
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
    const segmentDistance = calculateDistance(points[i - 1], points[i]);
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
};

// Process messages from main thread
self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  try {
    const { points, settings } = event.data;

    if (!points || !Array.isArray(points) || !settings) {
      throw new Error('Invalid input data');
    }

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistance += calculateDistance(points[i - 1], points[i]);
    }

    // Calculate elevation statistics
    const elevation = calculateElevation(points);

    // Calculate forecast points
    const forecastInterval = settings.forecastInterval || 5; // Default 5km intervals
    const forecastPoints = calculateForecastPoints(points, forecastInterval);

    // Calculate estimated duration
    const averageSpeed = settings.averageSpeed || 20; // Default 20km/h
    const estimatedDuration = totalDistance / averageSpeed;

    // Send results back to main thread
    const response: WorkerResponse = {
      success: true,
      totalDistance,
      elevation,
      forecastPoints,
      estimatedDuration,
      stats: {
        pointCount: points.length,
        forecastPointCount: forecastPoints.length,
      },
    };

    self.postMessage(response);
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
