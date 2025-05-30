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
 * Common GPX namespaces
 */
const GPX_NAMESPACES = {
  // Core GPX namespace
  gpx: 'http://www.topografix.com/GPX/1/1',
  // Extensions
  gpxdata: 'http://www.cluetrust.com/XML/GPXDATA/1/0',
  gpxtpx: 'http://www.garmin.com/xmlschemas/TrackPointExtension/v1',
  gpxx: 'http://www.garmin.com/xmlschemas/GpxExtensions/v3',
  wptx1: 'http://www.garmin.com/xmlschemas/WaypointExtension/v1',
  power: 'http://www.garmin.com/xmlschemas/PowerExtension/v1'
};

/**
 * Parse GPX file content into structured data
 */
export function parseGPX(gpxString: string): GPXData {
  try {
    // Check for empty input
    if (!gpxString || gpxString.trim() === '') {
      throw new Error('Empty GPX file content');
    }

    // Check file size to prevent memory issues
    const fileSizeKB = new Blob([gpxString]).size / 1024;
    console.log(`Processing GPX file: ${fileSizeKB.toFixed(1)} KB`);

    if (fileSizeKB > 10240) { // 10MB limit
      throw new Error(`GPX file too large: ${fileSizeKB.toFixed(1)} KB. Maximum size is 10MB.`);
    }

    // Pre-process the XML to handle namespace issues
    // This adds missing namespace declarations to the root element
    const processedGpxString = preprocessGpxNamespaces(gpxString);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(processedGpxString, 'text/xml');

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
    const nameElement =
      xmlDoc.querySelector('gpx > name') ||
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

    console.log(`Processing ${trackPoints.length} track points`);

    // Limit the number of points to prevent memory issues
    const maxPoints = 50000; // Reasonable limit for web processing
    if (trackPoints.length > maxPoints) {
      console.warn(`GPX file has ${trackPoints.length} points, limiting to ${maxPoints} for performance`);
      trackPoints.splice(maxPoints);
    }

    const routePoints: RoutePoint[] = [];
    let totalDistance = 0;
    let prevPoint: { lat: number; lon: number } | null = null;
    let elevationGain = 0;
    let elevationLoss = 0;
    let maxElevation = -Infinity;
    let minElevation = Infinity;

    // Process each track point with progress logging
    trackPoints.forEach((point, index) => {
      // Log progress for large files
      if (index % 1000 === 0 && index > 0) {
        console.log(`Processed ${index}/${trackPoints.length} points (${((index / trackPoints.length) * 100).toFixed(1)}%)`);
      }
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
        distance: totalDistance,
      });

      prevPoint = { lat, lon };
    });

    console.log(`GPX parsing completed: ${routePoints.length} points, ${totalDistance.toFixed(2)} km total distance`);

    return {
      name,
      points: routePoints,
      totalDistance,
      elevationGain,
      elevationLoss,
      maxElevation: minElevation === Infinity ? 0 : maxElevation,
      minElevation: minElevation === Infinity ? 0 : minElevation,
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
 * Preprocess GPX string to handle namespace issues
 * This function adds missing namespace declarations to the root element
 */
function preprocessGpxNamespaces(gpxString: string): string {
  // Check if the string contains GPX data
  if (!gpxString.includes('<gpx')) {
    return gpxString; // Not a GPX file, return as is
  }

  // Find the opening gpx tag
  const gpxTagMatch = gpxString.match(/<gpx[^>]*>/);
  if (!gpxTagMatch) {
    return gpxString; // No opening gpx tag found, return as is
  }

  const gpxTag = gpxTagMatch[0];
  let modifiedGpxTag = gpxTag;

  // Check for namespace prefixes used in the document
  const usedPrefixes = [];
  if (gpxString.includes('gpxdata:')) usedPrefixes.push('gpxdata');
  if (gpxString.includes('gpxtpx:')) usedPrefixes.push('gpxtpx');
  if (gpxString.includes('gpxx:')) usedPrefixes.push('gpxx');
  if (gpxString.includes('wptx1:')) usedPrefixes.push('wptx1');
  if (gpxString.includes('power:')) usedPrefixes.push('power');

  // Add missing namespace declarations
  for (const prefix of usedPrefixes) {
    if (!gpxTag.includes(`xmlns:${prefix}=`)) {
      // Remove the closing bracket to add the namespace
      modifiedGpxTag = modifiedGpxTag.replace('>', ` xmlns:${prefix}="${GPX_NAMESPACES[prefix as keyof typeof GPX_NAMESPACES]}">`);
    }
  }

  // Replace the original tag with the modified one
  return gpxString.replace(gpxTag, modifiedGpxTag);
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
      console.log('generateForecastPoints: No GPX data or points');
      return [];
    }

    // Validate interval to prevent infinite loops
    if (interval <= 0 || interval > 1000) {
      console.error('generateForecastPoints: Invalid interval', interval);
      throw new Error(`Invalid interval: ${interval}. Must be between 0 and 1000 km.`);
    }

    // Validate speed to prevent infinite loops
    if (avgSpeed <= 0 || avgSpeed > 200) {
      console.error('generateForecastPoints: Invalid speed', avgSpeed);
      throw new Error(`Invalid speed: ${avgSpeed}. Must be between 0 and 200 km/h.`);
    }

    const totalDistance = gpxData.totalDistance;
    const points = gpxData.points;

    console.log(`Generating forecast points: ${totalDistance.toFixed(2)} km route, ${interval} km intervals, ${avgSpeed} km/h speed`);

    // Calculate expected number of points to prevent excessive memory usage
    const expectedPoints = Math.ceil(totalDistance / interval) + 2; // +2 for start and end
    if (expectedPoints > 1000) {
      console.warn(`generateForecastPoints: Too many forecast points (${expectedPoints}), limiting interval`);
      interval = Math.max(interval, totalDistance / 998); // Limit to 998 points + start/end
    }

    const forecastPoints: ForecastPoint[] = [];

    // Always include the starting point
    forecastPoints.push({
      lat: points[0].lat,
      lon: points[0].lon,
      timestamp: Math.floor(startTime.getTime() / 1000),
      distance: 0,
    });

    // Calculate points at each interval with safety counter
    let safetyCounter = 0;
    const maxIterations = 1000; // Safety limit to prevent infinite loops

    for (let distance = interval; distance < totalDistance && safetyCounter < maxIterations; distance += interval, safetyCounter++) {
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
      const ratio =
        (distance - beforePoint.distance) / (afterPoint.distance - beforePoint.distance);
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
        distance,
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
      distance: totalDistance,
    });

    console.log(`Generated ${forecastPoints.length} forecast points (safety counter: ${safetyCounter}/${maxIterations})`);

    if (safetyCounter >= maxIterations) {
      console.warn('generateForecastPoints: Hit safety limit, some points may be missing');
    }

    return forecastPoints;
  } catch (error) {
    console.error('Error generating forecast points:', error);
    return [];
  }
}

export type { RoutePoint, GPXData };
