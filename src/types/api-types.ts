/**
 * API types for request and response objects
 */
import { WeatherData, ForecastPoint } from '@/features/weather/types';
import { GPXData } from '@/features/gpx/types';

/**
 * Base API response interface
 */
export interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  /** The response data (only present if success is true) */
  data?: T;
  /** The error message (only present if success is false) */
  error?: string;
  /** Additional error details (only present if success is false) */
  details?: unknown;
  /** HTTP status code */
  status?: number;
}

/**
 * Weather API request interface
 */
export interface WeatherApiRequest {
  /** Array of forecast points to get weather for */
  points: ForecastPoint[];
}

/**
 * Weather API response interface
 */
export interface WeatherApiResponse extends ApiResponse<(WeatherData | null)[]> {
  /** The provider that supplied the weather data */
  provider?: string;
  /** The timestamp when the data was fetched */
  timestamp?: number;
  /** The number of points that were successfully fetched */
  pointsProcessed?: number;
}

/**
 * GPX upload request interface
 */
export interface GpxUploadRequest {
  /** The GPX file content as a string */
  gpxContent: string;
  /** The original filename */
  filename: string;
}

/**
 * GPX upload response interface
 */
export interface GpxUploadResponse extends ApiResponse<GPXData> {
  /** The number of points in the GPX file */
  pointCount?: number;
  /** The total distance of the route in meters */
  totalDistance?: number;
}

/**
 * Route settings request interface
 */
export interface RouteSettingsRequest {
  /** The route ID */
  routeId: string;
  /** The start time of the route */
  startTime: string;
  /** The average speed in km/h */
  avgSpeed: number;
  /** The weather interval in kilometers */
  weatherInterval: number;
  /** Optional route name */
  routeName?: string;
  /** Optional route description */
  routeDescription?: string;
}

/**
 * Route settings response interface
 */
export interface RouteSettingsResponse extends ApiResponse<{
  /** The route ID */
  routeId: string;
  /** The settings that were applied */
  settings: RouteSettingsRequest;
}> {}

/**
 * Export request interface
 */
export interface ExportRequest {
  /** The route ID */
  routeId: string;
  /** The export format */
  format: 'pdf' | 'gpx' | 'json';
  /** Whether to include weather data */
  includeWeather: boolean;
  /** Whether to include map images */
  includeMap: boolean;
}

/**
 * Export response interface
 */
export interface ExportResponse extends ApiResponse<{
  /** The URL to download the exported file */
  downloadUrl: string;
  /** The filename of the exported file */
  filename: string;
  /** The size of the exported file in bytes */
  fileSize: number;
}> {}

/**
 * Share route request interface
 */
export interface ShareRouteRequest {
  /** The route ID */
  routeId: string;
  /** The expiration time in seconds */
  expiresIn?: number;
  /** Whether to allow editing */
  allowEdit?: boolean;
}

/**
 * Share route response interface
 */
export interface ShareRouteResponse extends ApiResponse<{
  /** The shareable URL */
  shareUrl: string;
  /** The share ID */
  shareId: string;
  /** When the share expires */
  expiresAt?: string;
}> {}

/**
 * User profile response interface
 */
export interface UserProfileResponse extends ApiResponse<{
  /** The user ID */
  userId: string;
  /** The user's email */
  email: string;
  /** The user's display name */
  displayName: string;
  /** The user's saved routes */
  savedRoutes: Array<{
    /** The route ID */
    routeId: string;
    /** The route name */
    name: string;
    /** When the route was created */
    createdAt: string;
    /** When the route was last modified */
    modifiedAt: string;
  }>;
}> {}
