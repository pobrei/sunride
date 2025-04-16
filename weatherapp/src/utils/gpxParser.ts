/**
 * GPX file parsing and processing utilities
 */
import { RoutePoint, ForecastPoint, GPXPoint, GPXData, ValidationError } from '@shared/types/gpx-types';

// ValidationError is now imported from shared/types/gpx-types

/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Validate inputs
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' ||
      typeof lat2 !== 'number' || typeof lon2 !== 'number') {
    throw new ValidationError('Invalid coordinates: all values must be numbers');
  }

  if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90 ||
      lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180) {
    throw new ValidationError('Invalid coordinates: latitude must be between -90 and 90, longitude between -180 and 180');
  }

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 * @param deg Angle in degrees
 * @returns Angle in radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Parse GPX file content into structured data
 * @param gpxString GPX file content as string
 * @returns Parsed GPX data
 */
export function parseGPX(gpxString: string): GPXData {
  if (!gpxString || typeof gpxString !== 'string') {
    throw new ValidationError('Invalid GPX data: empty or not a string');
  }

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxString, 'text/xml');

    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new ValidationError('Invalid GPX file: XML parsing error');
    }

    // Get name
    const nameElement = xmlDoc.querySelector('name') || xmlDoc.querySelector('n');
    const name = nameElement ? nameElement.textContent || 'Unnamed Route' : 'Unnamed Route';

    // Get track points
    const trackPoints = Array.from(xmlDoc.querySelectorAll('trkpt, rtept'));

    if (trackPoints.length === 0) {
      throw new ValidationError('No track points found in GPX file');
    }

    const routePoints: RoutePoint[] = [];
    let totalDistance = 0;
    let prevPoint: {lat: number, lon: number} | null = null;
    let elevationGain = 0;
    let elevationLoss = 0;
    let maxElevation = -Infinity;
    let minElevation = Infinity;

    trackPoints.forEach((point, index) => {
      const lat = parseFloat(point.getAttribute('lat') || '0');
      const lon = parseFloat(point.getAttribute('lon') || '0');

      // Validate coordinates
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        throw new ValidationError(`Invalid coordinates at point ${index + 1}`);
      }

      const elevationElement = point.querySelector('ele');
      const elevation = elevationElement ? parseFloat(elevationElement.textContent || '0') : 0;

      // Validate elevation
      if (elevationElement && isNaN(elevation)) {
        throw new ValidationError(`Invalid elevation at point ${index + 1}`);
      }

      const timeElement = point.querySelector('time');
      let time: Date | undefined = undefined;

      if (timeElement && timeElement.textContent) {
        try {
          time = new Date(timeElement.textContent);
          // Check if date is valid
          if (isNaN(time.getTime())) {
            time = undefined;
          }
        } catch (e) {
          // Invalid date format, ignore
          time = undefined;
        }
      }

      // Calculate distance
      if (prevPoint) {
        try {
          const segmentDistance = calculateDistance(prevPoint.lat, prevPoint.lon, lat, lon);
          totalDistance += segmentDistance;
        } catch (e) {
          // If distance calculation fails, use a fallback
          if (index > 0) {
            const lastDistance = routePoints[index - 1].distance;
            totalDistance = lastDistance + 0.01; // Add a small increment
          }
        }
      }

      // Calculate elevation changes
      if (index > 0) {
        const prevElevation = routePoints[index - 1].elevation;
        const elevationDiff = elevation - prevElevation;

        if (elevationDiff > 0) {
          elevationGain += elevationDiff;
        } else if (elevationDiff < 0) {
          elevationLoss += Math.abs(elevationDiff);
        }
      }

      // Update min/max elevation
      if (elevation > maxElevation) maxElevation = elevation;
      if (elevation < minElevation) minElevation = elevation;

      routePoints.push({
        lat,
        lon,
        elevation,
        time,
        distance: totalDistance
      });

      prevPoint = { lat, lon };
    });

    // Handle edge cases for min/max elevation
    if (minElevation === Infinity) minElevation = 0;
    if (maxElevation === -Infinity) maxElevation = 0;

    return {
      name,
      points: routePoints.map(point => ({
        lat: point.lat,
        lon: point.lon,
        ele: point.elevation,
        time: point.time
      })),
      totalDistance,
      elevationGain,
      elevationLoss,
      maxElevation,
      minElevation
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(`Failed to parse GPX file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate forecast points at given intervals along the route
 * @param gpxData Parsed GPX data
 * @param interval Distance interval in kilometers
 * @param startTime Start time for the route
 * @param avgSpeed Average speed in km/h
 * @returns Array of forecast points
 */
export function generateForecastPoints(
  gpxData: GPXData,
  interval: number,  // in km
  startTime: Date,
  avgSpeed: number   // in km/h
): ForecastPoint[] {
  // Validate inputs
  if (!gpxData || !gpxData.points || gpxData.points.length === 0) {
    throw new ValidationError('Invalid GPX data: missing or empty points array');
  }

  if (typeof interval !== 'number' || interval <= 0) {
    throw new ValidationError('Invalid interval: must be a positive number');
  }

  if (!(startTime instanceof Date) || isNaN(startTime.getTime())) {
    throw new ValidationError('Invalid start time: must be a valid Date object');
  }

  if (typeof avgSpeed !== 'number' || avgSpeed <= 0) {
    throw new ValidationError('Invalid average speed: must be a positive number');
  }

  const totalDistance = gpxData.totalDistance;
  const points = gpxData.points;
  const forecastPoints: ForecastPoint[] = [];

  // Always include the starting point
  forecastPoints.push({
    lat: points[0].lat,
    lon: points[0].lon,
    timestamp: Math.floor(startTime.getTime() / 1000),
    distance: 0
  });

  // Calculate points at each interval
  for (let distance = interval; distance < (totalDistance || 0); distance += interval) {
    // Find the two points that the interval falls between
    let beforeIndex = 0;
    let afterIndex = 0;

    for (let i = 0; i < points.length - 1; i++) {
      // Convert GPXPoint to RoutePoint for distance calculation
      const point = {
        lat: points[i].lat,
        lon: points[i].lon,
        elevation: points[i].ele,
        time: points[i].time,
        distance: 0 // Will be overridden by actual distance
      };
      const nextPoint = {
        lat: points[i + 1].lat,
        lon: points[i + 1].lon,
        elevation: points[i + 1].ele,
        time: points[i + 1].time,
        distance: 0 // Will be overridden by actual distance
      };
      // Get distance from the points array
      const pointDistance = i > 0 ? (points[i] as any).distance || 0 : 0;
      const nextPointDistance = (points[i + 1] as any).distance || 0;

      if (pointDistance <= distance && nextPointDistance >= distance) {
        beforeIndex = i;
        afterIndex = i + 1;
        break;
      }
    }

    const beforePoint = points[beforeIndex];
    const afterPoint = points[afterIndex];

    // Avoid division by zero
    const beforeDistance = (beforePoint as any).distance || 0;
    const afterDistance = (afterPoint as any).distance || 0;

    if (afterDistance === beforeDistance) {
      continue;
    }

    // Interpolate the position
    const ratio = (distance - beforeDistance) / (afterDistance - beforeDistance);
    const lat = beforePoint.lat + ratio * (afterPoint.lat - beforePoint.lat);
    const lon = beforePoint.lon + ratio * (afterPoint.lon - beforePoint.lon);

    // Calculate timestamp based on average speed
    const timeInHours = distance / avgSpeed;
    const timeInSeconds = timeInHours * 3600;
    const timestamp = Math.floor(startTime.getTime() / 1000 + timeInSeconds);

    forecastPoints.push({
      lat,
      lon,
      timestamp,
      distance
    });
  }

  // Always include the ending point
  const lastPoint = points[points.length - 1];
  const timeInHours = (totalDistance || 0) / avgSpeed;
  const timeInSeconds = timeInHours * 3600;
  const endTimestamp = Math.floor(startTime.getTime() / 1000 + timeInSeconds);

  // Only add the ending point if it's different from the last added point
  const lastAddedPoint = forecastPoints[forecastPoints.length - 1];
  if (lastAddedPoint.distance !== totalDistance) {
    forecastPoints.push({
      lat: lastPoint.lat,
      lon: lastPoint.lon,
      timestamp: endTimestamp,
      distance: totalDistance || 0
    });
  }

  return forecastPoints;
}