/**
 * GPX file parsing and processing types
 */

/**
 * Represents a single point in a GPX file
 */
export interface GPXPoint {
  /** Latitude in decimal degrees */
  lat: number;
  /** Longitude in decimal degrees */
  lon: number;
  /** Elevation in meters */
  ele: number;
  /** ISO timestamp string or Date object */
  time?: string | Date;
  /** Optional properties that might be present in some GPX files */
  [key: string]: unknown;
}

/**
 * Represents a track in a GPX file
 */
export interface GPXTrack {
  /** Name of the track */
  name: string;
  /** Array of points in the track */
  points: GPXPoint[];
}

/**
 * Elevation data structure
 */
export interface GPXElevation {
  /** Total elevation gain in meters */
  gain: number;
  /** Total elevation loss in meters */
  loss: number;
  /** Maximum elevation in meters */
  max: number;
  /** Minimum elevation in meters */
  min: number;
}

/**
 * Represents a complete GPX file
 */
export interface GPXData {
  /** Name of the route */
  name: string;
  /** Array of tracks in the GPX file (optional for backward compatibility) */
  tracks?: GPXTrack[];
  /** Flattened array of all points from all tracks */
  points: GPXPoint[];
  /** Total distance in kilometers */
  totalDistance?: number;
  /** Estimated duration in seconds */
  estimatedDuration?: number;

  /** Total elevation gain in meters (for backward compatibility) */
  elevationGain?: number;
  /** Total elevation loss in meters (for backward compatibility) */
  elevationLoss?: number;
  /** Maximum elevation in meters (for backward compatibility) */
  maxElevation?: number;
  /** Minimum elevation in meters (for backward compatibility) */
  minElevation?: number;

  /** Elevation data (structured format) */
  elevation?: GPXElevation;
}

/**
 * Route point with additional information
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
 * Forecast point along a route
 */
export interface ForecastPoint {
  /** Latitude in decimal degrees */
  lat: number;
  /** Longitude in decimal degrees */
  lon: number;
  /** Distance from the start of the route in kilometers */
  distance: number;
  /** Elevation in meters (optional) */
  elevation?: number;
  /** Unix timestamp in seconds */
  timestamp: number;
  /** Point index in the original route (optional) */
  index?: number;
}

/**
 * Convert GPXData to a compatible format
 * This function ensures that the GPXData object has both the structured elevation
 * property and the individual elevation properties for backward compatibility
 */
export function normalizeGPXData(data: GPXData): GPXData {
  const result = { ...data };

  // Ensure elevation object exists
  if (!result.elevation && (result.elevationGain !== undefined ||
                           result.elevationLoss !== undefined ||
                           result.maxElevation !== undefined ||
                           result.minElevation !== undefined)) {
    result.elevation = {
      gain: result.elevationGain || 0,
      loss: result.elevationLoss || 0,
      max: result.maxElevation || 0,
      min: result.minElevation || 0
    };
  }

  // Ensure individual elevation properties exist
  if (result.elevation && (result.elevationGain === undefined ||
                          result.elevationLoss === undefined ||
                          result.maxElevation === undefined ||
                          result.minElevation === undefined)) {
    result.elevationGain = result.elevation.gain;
    result.elevationLoss = result.elevation.loss;
    result.maxElevation = result.elevation.max;
    result.minElevation = result.elevation.min;
  }

  // Ensure tracks array exists
  if (!result.tracks) {
    result.tracks = [{
      name: result.name,
      points: result.points
    }];
  }

  return result;
}

/**
 * Convert a GPXPoint to a RoutePoint
 */
export function gpxPointToRoutePoint(point: GPXPoint, distance: number): RoutePoint {
  return {
    lat: point.lat,
    lon: point.lon,
    elevation: point.ele,
    time: point.time instanceof Date ? point.time : (point.time ? new Date(point.time) : undefined),
    distance
  };
}

/**
 * Convert a RoutePoint to a ForecastPoint
 */
export function routePointToForecastPoint(point: RoutePoint, timestamp: number, index?: number): ForecastPoint {
  return {
    lat: point.lat,
    lon: point.lon,
    distance: point.distance,
    elevation: point.elevation,
    timestamp,
    index
  };
}

/**
 * GPX parser options
 */
export interface GPXParserOptions {
  /** Whether to include time information */
  includeTime?: boolean;
  /** Whether to calculate elevation statistics */
  calculateElevation?: boolean;
  /** Whether to calculate distance */
  calculateDistance?: boolean;
  /** Whether to simplify the track points */
  simplifyTrack?: boolean;
  /** Tolerance for track simplification (in meters) */
  simplifyTolerance?: number;
}

/**
 * GPX validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';

    // This is needed for instanceof to work correctly with classes that extend Error
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * GPX parsing error
 */
export class GPXParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GPXParseError';
  }
}

/**
 * GPX forecast generation options
 */
export interface ForecastGenerationOptions {
  /** Interval between forecast points in kilometers */
  interval: number;
  /** Start time of the route */
  startTime: Date;
  /** Average speed in km/h */
  avgSpeed: number;
}

/**
 * GPX forecast generation result
 */
export interface ForecastGenerationResult {
  /** Array of forecast points */
  forecastPoints: Array<{
    /** Latitude in decimal degrees */
    lat: number;
    /** Longitude in decimal degrees */
    lon: number;
    /** Distance from the start of the route in kilometers */
    distance: number;
    /** Elevation in meters */
    elevation?: number;
    /** Unix timestamp in seconds */
    timestamp: number;
    /** Point index in the original route */
    index: number;
  }>;
  /** Total distance in kilometers */
  totalDistance: number;
  /** Estimated duration in hours */
  estimatedDuration: number;
}

/**
 * GPX processor result
 */
export interface GPXProcessorResult {
  /** Whether the processing was successful */
  success: boolean;
  /** Error message if processing failed */
  error?: string;
  /** Total distance in kilometers */
  totalDistance?: number;
  /** Elevation statistics */
  elevation?: GPXElevation;
  /** Forecast points along the route */
  forecastPoints?: Array<{
    /** Latitude in decimal degrees */
    lat: number;
    /** Longitude in decimal degrees */
    lon: number;
    /** Distance from the start of the route in kilometers */
    distance: number;
    /** Elevation in meters */
    elevation?: number;
    /** Point index in the original route */
    index: number;
  }>;
  /** Estimated duration in hours */
  estimatedDuration?: number;
  /** Processing statistics */
  stats?: {
    /** Number of points processed */
    pointCount: number;
    /** Number of forecast points generated */
    forecastPointCount: number;
  };
}
