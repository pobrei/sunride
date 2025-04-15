import { GPXData } from '@frontend/features/gpx/types';
import { ForecastPoint } from '@frontend/features/weather/types';

/**
 * Generate forecast points from GPX data
 * This creates points at regular intervals along the route
 * 
 * @param gpxData - The parsed GPX data
 * @param interval - The interval in kilometers between forecast points (default: 5)
 * @returns Array of forecast points
 */
export function generateForecastPoints(
  gpxData: GPXData,
  interval: number = 5
): ForecastPoint[] {
  if (!gpxData || !gpxData.points || gpxData.points.length === 0) {
    return [];
  }

  const points: ForecastPoint[] = [];
  const routePoints = gpxData.points;
  const totalDistance = gpxData.totalDistance;

  // Always include the start point
  const startPoint = routePoints[0];
  points.push({
    lat: startPoint.lat,
    lon: startPoint.lon,
    timestamp: startPoint.time ? startPoint.time.getTime() / 1000 : Date.now() / 1000,
    distance: 0,
  });

  // Add points at regular intervals
  let currentDistance = interval;
  while (currentDistance < totalDistance) {
    // Find the closest route point to this distance
    const closestPoint = findClosestPointByDistance(routePoints, currentDistance);
    
    if (closestPoint) {
      points.push({
        lat: closestPoint.lat,
        lon: closestPoint.lon,
        timestamp: closestPoint.time ? closestPoint.time.getTime() / 1000 : Date.now() / 1000,
        distance: currentDistance,
      });
    }
    
    currentDistance += interval;
  }

  // Always include the end point
  const endPoint = routePoints[routePoints.length - 1];
  if (endPoint.distance > points[points.length - 1].distance) {
    points.push({
      lat: endPoint.lat,
      lon: endPoint.lon,
      timestamp: endPoint.time ? endPoint.time.getTime() / 1000 : Date.now() / 1000,
      distance: endPoint.distance,
    });
  }

  return points;
}

/**
 * Find the route point closest to a given distance
 * 
 * @param routePoints - Array of route points
 * @param targetDistance - The target distance in kilometers
 * @returns The closest route point or null if no points are available
 */
function findClosestPointByDistance(routePoints: any[], targetDistance: number) {
  if (!routePoints || routePoints.length === 0) {
    return null;
  }

  let closestPoint = routePoints[0];
  let minDiff = Math.abs(closestPoint.distance - targetDistance);

  for (const point of routePoints) {
    const diff = Math.abs(point.distance - targetDistance);
    if (diff < minDiff) {
      minDiff = diff;
      closestPoint = point;
    }
  }

  return closestPoint;
}
