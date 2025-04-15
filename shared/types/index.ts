// Import types from feature folders
// Define core types directly to avoid circular dependencies

/**
 * Weather Data Types
 */

// Re-export weather types from weather-types.ts
export * from './weather-types';

// ForecastPoint is now defined in gpx-types.ts

// GPXElevation is now defined in gpx-types.ts

/**
 * Worker request for GPX processing
 */
export interface WorkerRequest {
  /** Array of GPX points to process */
  points: GPXPoint[] | RoutePoint[];
  /** Processing settings */
  settings: {
    /** Interval between forecast points in kilometers */
    forecastInterval?: number;
    /** Average speed in km/h */
    averageSpeed?: number;
  };
}

/**
 * Worker response from GPX processing
 */
export interface WorkerResponse {
  /** Whether the processing was successful */
  success: boolean;
  /** Error message if processing failed */
  error?: string;
  /** Total distance in kilometers */
  totalDistance?: number;
  /** Elevation statistics */
  elevation?: GPXElevation;
  /** Forecast points along the route */
  forecastPoints?: ForecastPoint[];
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

// RoutePoint is now defined in gpx-types.ts

// Import utility types
import * as UtilityTypes from './utility-types';

// Re-export utility types
export * from './utility-types';

/**
 * GPX Types
 */

// Re-export GPX types from gpx-types.ts
export * from './gpx-types';

/**
 * UI Types
 */

/**
 * Available notification variants for styling
 */
export type NotificationVariant = 'success' | 'error' | 'info' | 'warning';

/**
 * Notification object structure
 */
export interface NotificationType {
  /** Unique identifier for the notification */
  id: string;
  /** Type of notification that determines the styling */
  type: NotificationVariant;
  /** Message to display in the notification */
  message: string;
  /** Duration in milliseconds before auto-dismissing (undefined = no auto-dismiss) */
  duration?: number;
  /** Optional title for the notification */
  title?: string;
  /** Optional action button text */
  actionText?: string;
  /** Optional callback for the action button */
  onAction?: () => void;
  /** Optional callback when notification is dismissed */
  onDismiss?: () => void;
}

// Map Types
export interface MapViewport {
  /** Center coordinates [longitude, latitude] */
  center: [number, number];
  /** Zoom level (typically 0-20) */
  zoom: number;
  /** Optional rotation in radians */
  rotation?: number;
  /** Optional pitch/tilt in radians */
  pitch?: number;
}

export interface MapMarker {
  /** Unique identifier for the marker */
  id: string;
  /** Coordinates [longitude, latitude] */
  position: [number, number];
  /** Optional marker label */
  label?: string;
  /** Optional marker color */
  color?: string;
  /** Optional marker icon */
  icon?: string;
  /** Optional marker size */
  size?: 'small' | 'medium' | 'large';
  /** Optional marker data */
  data?: Record<string, unknown>;
}

export interface MapLayer {
  /** Unique identifier for the layer */
  id: string;
  /** Layer type */
  type: 'tile' | 'vector' | 'heatmap' | 'cluster';
  /** Layer source */
  source: string;
  /** Layer visibility */
  visible: boolean;
  /** Layer opacity (0-1) */
  opacity: number;
  /** Layer z-index */
  zIndex: number;
  /** Optional layer style */
  style?: Record<string, unknown>;
}

// Chart Types
export type ChartType =
  | 'line'
  | 'bar'
  | 'radar'
  | 'pie'
  | 'doughnut'
  | 'polarArea'
  | 'scatter'
  | 'bubble';

export interface ChartDataset {
  /** Dataset label */
  label: string;
  /** Dataset values */
  data: number[];
  /** Border color (CSS color string) */
  borderColor: string;
  /** Background color (CSS color string) */
  backgroundColor: string;
  /** Whether to fill the area under the line (line charts) */
  fill?: boolean;
  /** Border width in pixels */
  borderWidth?: number;
  /** Point radius in pixels */
  pointRadius?: number;
  /** Point hover radius in pixels */
  pointHoverRadius?: number;
  /** Point background color */
  pointBackgroundColor?: string;
  /** Point border color */
  pointBorderColor?: string;
  /** Line tension (0-1) for smoothing */
  tension?: number;
  /** Whether to show the line (line charts) */
  showLine?: boolean;
  /** Whether to stack the dataset */
  stack?: string;
  /** Y-axis ID */
  yAxisID?: string;
  /** X-axis ID */
  xAxisID?: string;
  /** Order of the dataset */
  order?: number;
}

export interface ChartData {
  /** X-axis labels */
  labels: string[];
  /** Chart datasets */
  datasets: ChartDataset[];
}

export interface ChartOptions {
  /** Chart title configuration */
  title?: {
    display: boolean;
    text: string;
    fontSize?: number;
    position?: 'top' | 'bottom' | 'left' | 'right';
  };
  /** Chart legend configuration */
  legend?: {
    display: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
  };
  /** Chart tooltip configuration */
  tooltip?: {
    enabled: boolean;
    mode?: 'point' | 'nearest' | 'index' | 'dataset' | 'x' | 'y';
    intersect?: boolean;
  };
  /** Chart animation configuration */
  animation?: {
    duration: number;
    easing?: string;
  };
  /** Chart scales configuration */
  scales?: {
    x?: {
      type?: 'linear' | 'logarithmic' | 'category' | 'time';
      display?: boolean;
      title?: {
        display: boolean;
        text: string;
      };
      grid?: {
        display: boolean;
      };
    };
    y?: {
      type?: 'linear' | 'logarithmic' | 'category' | 'time';
      display?: boolean;
      title?: {
        display: boolean;
        text: string;
      };
      grid?: {
        display: boolean;
      };
      min?: number;
      max?: number;
      beginAtZero?: boolean;
    };
  };
}

// Route Types
export interface RouteSettings {
  /** Start time of the route */
  startTime: Date;
  /** Interval between weather forecast points in minutes */
  weatherInterval: number;
  /** Average speed in km/h */
  avgSpeed: number;
  /** Optional route name */
  routeName?: string;
  /** Optional route description */
  routeDescription?: string;
  /** Optional route color */
  routeColor?: string;
}

export interface RouteMetrics {
  /** Total distance in kilometers */
  totalDistance: number;
  /** Total elevation gain in meters */
  totalElevationGain: number;
  /** Total elevation loss in meters */
  totalElevationLoss: number;
  /** Maximum elevation in meters */
  maxElevation: number;
  /** Minimum elevation in meters */
  minElevation: number;
  /** Start time as ISO string */
  startTime: string;
  /** End time as ISO string */
  endTime: string;
  /** Optional estimated duration in minutes */
  estimatedDuration?: number;
  /** Optional estimated calories burned */
  estimatedCalories?: number;
  /** Optional difficulty rating (1-5) */
  difficultyRating?: number;
}

// Export Types
export type ExportFormat = 'pdf' | 'png' | 'jpg' | 'svg' | 'csv' | 'json' | 'gpx';

export interface ExportOptions {
  /** Whether to include the map in the export */
  includeMap: boolean;
  /** Whether to include charts in the export */
  includeCharts: boolean;
  /** Whether to include weather data in the export */
  includeWeather: boolean;
  /** Whether to include route metrics in the export */
  includeMetrics: boolean;
  /** Export file format */
  format: ExportFormat;
  /** Optional export quality (0-1) for image formats */
  quality?: number;
  /** Optional page size for PDF exports */
  pageSize?: 'A4' | 'A3' | 'Letter' | 'Legal';
  /** Optional page orientation for PDF exports */
  orientation?: 'portrait' | 'landscape';
  /** Optional title for the export */
  title?: string;
  /** Optional filename for the export */
  filename?: string;
}

// Weather Provider Types
export interface WeatherProvider {
  /** Unique identifier for the weather provider */
  id: string;
  /** Display name of the weather provider */
  name: string;
  /** Description of the weather provider */
  description: string;
  /** API URL of the weather provider */
  url: string;
  /** Optional API key for the weather provider */
  apiKey?: string;
  /** Whether the weather provider is enabled */
  enabled: boolean;
  /** Optional logo URL for the weather provider */
  logoUrl?: string;
  /** Optional attribution text for the weather provider */
  attribution?: string;
  /** Optional pricing tier */
  pricingTier?: 'free' | 'basic' | 'premium' | 'enterprise';
  /** Optional rate limit information */
  rateLimit?: {
    /** Maximum number of requests per time window */
    maxRequests: number;
    /** Time window in milliseconds */
    timeWindow: number;
    /** Whether to use a shared rate limit across all users */
    isShared: boolean;
  };
}
