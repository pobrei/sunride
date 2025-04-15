import { GPXData } from '@frontend/features/gpx/types';
import { ForecastPoint, WeatherData } from '@frontend/features/weather/types';

/**
 * Props for the Map component
 */
export interface MapProps {
  /** GPX data containing route information */
  gpxData: GPXData | null;
  /** Array of forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Callback for when a marker is clicked */
  onMarkerClick: (index: number) => void;
  /** Index of the currently selected marker */
  selectedMarker: number | null;
}

/**
 * Props for the OpenLayersMap component
 */
export interface OpenLayersMapProps extends MapProps {}

/**
 * Props for the SimpleMap component
 */
export interface SimpleMapProps extends MapProps {}

/**
 * Map viewport configuration
 */
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

/**
 * Map marker configuration
 */
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

/**
 * Map layer configuration
 */
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
