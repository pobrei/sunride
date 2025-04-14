import { ForecastPoint } from '@/features/weather/types';

/**
 * Represents a single point in a GPX route
 */
export interface RoutePoint {
  /** Latitude in decimal degrees */
  lat: number;
  /** Longitude in decimal degrees */
  lon: number;
  /** Elevation in meters */
  elevation: number;
  /** Timestamp of when the point was recorded (optional) */
  time?: Date;
  /** Distance from the start of the route in kilometers */
  distance: number;
}

/**
 * Represents parsed GPX data with route information
 */
export interface GPXData {
  /** Name of the route */
  name: string;
  /** Array of route points */
  points: RoutePoint[];
  /** Total distance of the route in kilometers */
  totalDistance: number;
  /** Total elevation gain in meters */
  elevationGain: number;
  /** Total elevation loss in meters */
  elevationLoss: number;
  /** Maximum elevation in meters */
  maxElevation: number;
  /** Minimum elevation in meters */
  minElevation: number;
  /** Estimated duration in seconds (optional) */
  estimatedDuration?: number;
  /** Elevation data (optional) */
  elevation?: {
    /** Total elevation gain in meters */
    gain: number;
    /** Total elevation loss in meters */
    loss: number;
  };
}

/**
 * Calculate distance between two geographic points using the Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Parse GPX file content into structured data
 */
export function parseGPX(gpxString: string): GPXData {
  try {
    // Check for empty input
    if (!gpxString || gpxString.trim() === '') {
      throw new Error('Empty GPX file content');
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxString, 'text/xml');

    // Check for XML parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      const errorMessage = parseError.textContent || 'XML parsing error';
      throw new Error(`Failed to parse GPX file: ${errorMessage}`);
    }

    // Verify this is a GPX document
    const gpxElement = xmlDoc.querySelector('gpx');
    if (!gpxElement) {
      throw new Error('Not a valid GPX file: Missing <gpx> root element');
    }

    // Get name with fallbacks
    let name = 'Unnamed Route';
    const nameElement = xmlDoc.querySelector('gpx > name') ||
                        xmlDoc.querySelector('trk > name') ||
                        xmlDoc.querySelector('rte > name') ||
                        xmlDoc.querySelector('n');
    if (nameElement && nameElement.textContent) {
      name = nameElement.textContent.trim();
    }

    // Get track points
    const trackPoints = Array.from(xmlDoc.querySelectorAll('trkpt, rtept'));

    if (trackPoints.length === 0) {
      throw new Error('No track points found in GPX file');
    }

    const routePoints: RoutePoint[] = [];
    let totalDistance = 0;
    let prevPoint: {lat: number, lon: number} | null = null;
    let elevationGain = 0;
    let elevationLoss = 0;
    let maxElevation = -Infinity;
    let minElevation = Infinity;

    // Process each track point
    trackPoints.forEach((point, index) => {
      const lat = parseFloat(point.getAttribute('lat') || '0');
      const lon = parseFloat(point.getAttribute('lon') || '0');
      const elevationElement = point.querySelector('ele');
      const elevation = elevationElement ? parseFloat(elevationElement.textContent || '0') : 0;
      const timeElement = point.querySelector('time');
      const time = timeElement ? new Date(timeElement.textContent || '') : undefined;

      // Calculate distance
      if (prevPoint) {
        const segmentDistance = calculateDistance(prevPoint.lat, prevPoint.lon, lat, lon);
        totalDistance += segmentDistance;
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

    return {
      name,
      points: routePoints,
      totalDistance,
      elevationGain,
      elevationLoss,
      maxElevation: minElevation === Infinity ? 0 : maxElevation,
      minElevation: minElevation === Infinity ? 0 : minElevation
    };
  } catch (error) {
    console.error('Error processing GPX data:', error);
    throw new Error(
      error instanceof Error
        ? `Error processing GPX data: ${error.message}`
        : 'Unknown error processing GPX data'
    );
  }
}

/**
 * Generate forecast points at given intervals along the route
 */
export function generateForecastPoints(
  gpxData: GPXData,
  interval: number,
  startTime: Date,
  avgSpeed: number
): ForecastPoint[] {
  try {
    // Validate input parameters
    if (!gpxData || !gpxData.points || gpxData.points.length === 0) {
      return [];
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
    for (let distance = interval; distance < totalDistance; distance += interval) {
      // Find the two points that the interval falls between
      let beforeIndex = 0;
      let afterIndex = 0;

      for (let i = 0; i < points.length - 1; i++) {
        if (points[i].distance <= distance && points[i + 1].distance >= distance) {
          beforeIndex = i;
          afterIndex = i + 1;
          break;
        }
      }

      const beforePoint = points[beforeIndex];
      const afterPoint = points[afterIndex];

      // Interpolate the position
      const ratio = (distance - beforePoint.distance) / (afterPoint.distance - beforePoint.distance);
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
    const timeInHours = totalDistance / avgSpeed;
    const timeInSeconds = timeInHours * 3600;
    const endTimestamp = Math.floor(startTime.getTime() / 1000 + timeInSeconds);

    forecastPoints.push({
      lat: lastPoint.lat,
      lon: lastPoint.lon,
      timestamp: endTimestamp,
      distance: totalDistance
    });

    return forecastPoints;
  } catch (error) {
    console.error('Error generating forecast points:', error);
    return [];
  }
}

export type { RoutePoint, GPXData };