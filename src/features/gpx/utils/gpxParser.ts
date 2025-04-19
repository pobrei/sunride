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
  power: 'http://www.garmin.com/xmlschemas/PowerExtension/v1',
  hr: 'http://www.garmin.com/xmlschemas/HeartRateExtension/v1'
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

    // Pre-process the XML to handle namespace issues
    // This adds missing namespace declarations to the root element
    const processedGpxString = preprocessGpxNamespaces(gpxString);

    // Try parsing with DOMParser
    let xmlDoc;
    let parseError;

    try {
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(processedGpxString, 'text/xml');

      // Check for XML parsing errors
      parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        console.warn('Initial parsing failed, attempting fallback parsing method');
        // Don't throw yet - we'll try a fallback approach
      }
    } catch (error) {
      console.warn('DOMParser threw an error, attempting fallback parsing method');
      // Don't throw yet - we'll try a fallback approach
    }

    // If we have parsing errors, try a more aggressive cleanup approach
    if (parseError) {
      try {
        // More aggressive preprocessing
        let cleanedString = processedGpxString;

        // 1. Remove all namespace prefixes (risky but might work as fallback)
        const prefixRegex = /([a-zA-Z0-9]+):/g;
        cleanedString = cleanedString.replace(prefixRegex, '');

        // 2. Try to parse again
        const fallbackParser = new DOMParser();
        xmlDoc = fallbackParser.parseFromString(cleanedString, 'text/xml');

        // Check if we still have errors
        parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
          // Try one more approach - create a minimal valid GPX structure
          console.warn('Second parsing attempt failed, trying minimal GPX structure');

          // Extract track points using regex
          const trkptRegex = /<trkpt[^>]*lat=["']([^"\']+)["'][^>]*lon=["']([^"\']+)["'][^>]*>([\s\S]*?)<\/trkpt>/g;
          const rteptRegex = /<rtept[^>]*lat=["']([^"\']+)["'][^>]*lon=["']([^"\']+)["'][^>]*>([\s\S]*?)<\/rtept>/g;

          let points = [];
          let match;

          // Extract track points
          while ((match = trkptRegex.exec(processedGpxString)) !== null) {
            points.push({
              lat: match[1],
              lon: match[2],
              content: match[3]
            });
          }

          // If no track points, try route points
          if (points.length === 0) {
            while ((match = rteptRegex.exec(processedGpxString)) !== null) {
              points.push({
                lat: match[1],
                lon: match[2],
                content: match[3]
              });
            }
          }

          if (points.length > 0) {
            // Create a minimal valid GPX document
            let minimalGpx = '<?xml version="1.0" encoding="UTF-8"?>\n';
            minimalGpx += '<gpx version="1.1" creator="SunRide" xmlns="http://www.topografix.com/GPX/1/1">\n';
            minimalGpx += '<trk><trkseg>\n';

            // Add all points
            for (const point of points) {
              minimalGpx += `<trkpt lat="${point.lat}" lon="${point.lon}">\n`;

              // Try to extract elevation
              const eleMatch = point.content.match(/<ele>([^<]+)<\/ele>/);
              if (eleMatch) {
                minimalGpx += `<ele>${eleMatch[1]}</ele>\n`;
              }

              // Try to extract time
              const timeMatch = point.content.match(/<time>([^<]+)<\/time>/);
              if (timeMatch) {
                minimalGpx += `<time>${timeMatch[1]}</time>\n`;
              }

              minimalGpx += '</trkpt>\n';
            }

            minimalGpx += '</trkseg></trk>\n';
            minimalGpx += '</gpx>';

            // Try parsing the minimal GPX
            const lastChanceParser = new DOMParser();
            xmlDoc = lastChanceParser.parseFromString(minimalGpx, 'text/xml');

            // Check if we still have errors
            parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
              const errorMessage = parseError.textContent || 'XML parsing error';
              throw new Error(`Failed to parse GPX file: ${errorMessage}`);
            }

            console.log('Minimal GPX structure parsing succeeded');
          } else {
            const errorMessage = parseError.textContent || 'XML parsing error';
            throw new Error(`Failed to parse GPX file: ${errorMessage}`);
          }
        } else {
          console.log('Fallback parsing succeeded');
        }
      } catch (_) {
        // If all fallbacks fail, throw the original error
        const errorMessage = parseError.textContent || 'XML parsing error';
        throw new Error(`Failed to parse GPX file: ${errorMessage}`);
      }
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

    // Try to get track points using various selectors
    let trackPoints = Array.from(xmlDoc.querySelectorAll('trkpt, rtept'));

    // If no track points found, try other possible formats
    if (trackPoints.length === 0) {
      console.warn('No standard track points found, trying alternative selectors');

      // Try waypoints
      trackPoints = Array.from(xmlDoc.querySelectorAll('wpt'));

      // Try generic point elements
      if (trackPoints.length === 0) {
        trackPoints = Array.from(xmlDoc.querySelectorAll('point, pt'));
      }

      // Try to find any elements with lat/lon attributes
      if (trackPoints.length === 0) {
        trackPoints = Array.from(xmlDoc.querySelectorAll('*[lat][lon]'));
      }

      // If still no points, provide a sample route as fallback
      if (trackPoints.length === 0) {
        console.warn('No points found in GPX file, using sample route');
        return createSampleRoute();
      }
    }

    const routePoints: RoutePoint[] = [];
    let totalDistance = 0;
    let prevPoint: { lat: number; lon: number } | null = null;
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
        distance: totalDistance,
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
 * and also attempts to fix common XML parsing issues
 */
function preprocessGpxNamespaces(gpxString: string): string {
  // Check if the string contains GPX data
  if (!gpxString.includes('<gpx')) {
    return gpxString; // Not a GPX file, return as is
  }

  // Fix common issues with GPX files

  // 1. Fix non-absolute URIs in xmlns attributes (add http: if missing)
  gpxString = gpxString.replace(/xmlns\s*=\s*["']\s*\/\/([^"']+)["']/g, 'xmlns="http://$1"');
  gpxString = gpxString.replace(/xmlns:([^\s=]+)\s*=\s*["']\s*\/\/([^"']+)["']/g, 'xmlns:$1="http://$2"');

  // 2. Remove any XML declarations after the first one (extra content issue)
  const xmlDeclRegex = /<\?xml[^>]*\?>/g;
  let firstMatch = true;
  gpxString = gpxString.replace(xmlDeclRegex, (match) => {
    if (firstMatch) {
      firstMatch = false;
      return match;
    }
    return ''; // Remove additional XML declarations
  });

  // 3. Remove any DOCTYPE declarations (can cause parsing issues)
  gpxString = gpxString.replace(/<!DOCTYPE[^>]*>/g, '');

  // Find the opening gpx tag
  const gpxTagMatch = gpxString.match(/<gpx[^>]*>/);
  if (!gpxTagMatch) {
    return gpxString; // No opening gpx tag found, return as is
  }

  const gpxTag = gpxTagMatch[0];
  let modifiedGpxTag = gpxTag;

  // Check for namespace prefixes used in the document
  const usedPrefixes = [];
  // Use regex to find all namespace prefixes in the document
  const prefixRegex = /([a-zA-Z0-9]+):/g;
  let match;
  const foundPrefixes = new Set<string>();

  while ((match = prefixRegex.exec(gpxString)) !== null) {
    foundPrefixes.add(match[1]);
  }

  // Add known prefixes that were found
  for (const prefix of foundPrefixes) {
    if (prefix in GPX_NAMESPACES && !gpxTag.includes(`xmlns:${prefix}=`)) {
      usedPrefixes.push(prefix);
    }
  }

  // Also check for specific known prefixes
  if (gpxString.includes('gpxdata:') && !usedPrefixes.includes('gpxdata')) usedPrefixes.push('gpxdata');
  if (gpxString.includes('gpxtpx:') && !usedPrefixes.includes('gpxtpx')) usedPrefixes.push('gpxtpx');
  if (gpxString.includes('gpxx:') && !usedPrefixes.includes('gpxx')) usedPrefixes.push('gpxx');
  if (gpxString.includes('wptx1:') && !usedPrefixes.includes('wptx1')) usedPrefixes.push('wptx1');
  if (gpxString.includes('power:') && !usedPrefixes.includes('power')) usedPrefixes.push('power');
  if (gpxString.includes('hr:') && !usedPrefixes.includes('hr')) {
    // Add a custom namespace for heart rate data
    GPX_NAMESPACES['hr' as keyof typeof GPX_NAMESPACES] = 'http://www.garmin.com/xmlschemas/HeartRateExtension/v1';
    usedPrefixes.push('hr');
  }

  // Add missing namespace declarations
  for (const prefix of usedPrefixes) {
    if (!gpxTag.includes(`xmlns:${prefix}=`)) {
      // Remove the closing bracket to add the namespace
      modifiedGpxTag = modifiedGpxTag.replace('>', ` xmlns:${prefix}="${GPX_NAMESPACES[prefix as keyof typeof GPX_NAMESPACES]}">`);
    }
  }

  // Replace the original tag with the modified one
  let processedString = gpxString.replace(gpxTag, modifiedGpxTag);

  // Additional preprocessing to handle common XML issues

  // 1. Remove invalid characters that might cause parsing errors
  processedString = processedString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Try to fix unclosed tags by looking for common patterns
  const unclosedTagsRegex = /<([a-zA-Z0-9]+)([^>]*)>([^<]*)/g;
  processedString = processedString.replace(unclosedTagsRegex, (match, tag, attrs, content) => {
    // If the content doesn't contain any tags and the match doesn't end with a closing tag
    if (!content.includes('<') && !match.endsWith(`</${tag}>`)) {
      return `<${tag}${attrs}>${content}</${tag}>`;
    }
    return match;
  });

  // 3. Ensure there's only one root element by wrapping everything in a gpx tag if needed
  if (processedString.match(/<\/gpx>/g)?.length > 1) {
    // Multiple closing gpx tags found, try to fix by extracting content from the first complete gpx element
    const fullGpxMatch = processedString.match(/<gpx[^>]*>([\s\S]*?)<\/gpx>/);
    if (fullGpxMatch) {
      processedString = fullGpxMatch[0]; // Just keep the first complete gpx element
    }
  }

  return processedString;
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
      distance: 0,
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

    return forecastPoints;
  } catch (error) {
    console.error('Error generating forecast points:', error);
    return [];
  }
}

/**
 * Create a sample route as a fallback when GPX parsing fails
 * This provides a circular route that can be used for demonstration purposes
 */
function createSampleRoute(): GPXData {
  const centerLat = 52.3676; // Amsterdam
  const centerLon = 4.9041;
  const routePoints: RoutePoint[] = [];
  let totalDistance = 0;
  let prevPoint: { lat: number; lon: number } | null = null;

  // Create a circular route with 20 points
  const radius = 0.05; // roughly 5km
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const lat = centerLat + Math.sin(angle) * radius;
    const lon = centerLon + Math.cos(angle) * radius;
    const elevation = 10 + Math.sin(angle) * 50; // Elevation between 10 and 60 meters

    // Calculate time (one point every 5 minutes)
    const time = new Date(now.getTime() + i * 5 * 60 * 1000);

    // Calculate distance from previous point
    if (prevPoint) {
      const segmentDistance = calculateDistance(prevPoint.lat, prevPoint.lon, lat, lon);
      totalDistance += segmentDistance;
    }

    routePoints.push({
      lat,
      lon,
      elevation,
      time,
      distance: totalDistance,
    });

    prevPoint = { lat, lon };
  }

  return {
    name: 'Sample Route (Amsterdam)',
    points: routePoints,
    totalDistance,
    elevationGain: 100,
    elevationLoss: 100,
    maxElevation: 60,
    minElevation: 10,
  };
}

export type { RoutePoint, GPXData };
