import { z } from 'zod';

/**
 * Schema for a GPX point
 */
export const gpxPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  elevation: z.number(),
  time: z.date().optional(),
  distance: z.number().min(0),
});

/**
 * Schema for GPX data
 */
export const gpxDataSchema = z.object({
  name: z.string(),
  points: z.array(gpxPointSchema),
  totalDistance: z.number().min(0),
  elevationGain: z.number().min(0),
  elevationLoss: z.number().min(0),
  maxElevation: z.number(),
  minElevation: z.number(),
});

/**
 * Schema for a forecast point
 */
export const forecastPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  timestamp: z.number(),
  distance: z.number().min(0),
});

/**
 * Schema for weather data
 */
export const weatherDataSchema = z.object({
  temperature: z.number(),
  feelsLike: z.number(),
  humidity: z.number().min(0).max(100),
  pressure: z.number().min(800).max(1200),
  windSpeed: z.number().min(0),
  windDirection: z.number().min(0).max(360),
  rain: z.number().min(0),
  weatherIcon: z.string(),
  weatherDescription: z.string(),
  uvIndex: z.number().min(0).max(12).optional(),
  windGust: z.number().min(0).optional(),
  precipitationProbability: z.number().min(0).max(1).optional(),
  precipitation: z.number().min(0).optional(),
  snow: z.number().min(0).optional(),
});

/**
 * Schema for route settings
 */
export const routeSettingsSchema = z.object({
  startTime: z.date(),
  weatherInterval: z.number().min(0.1).max(50),
  avgSpeed: z.number().min(1).max(100),
  routeName: z.string().optional(),
  routeDescription: z.string().optional(),
  routeColor: z.string().optional(),
});

/**
 * Schema for route metrics
 */
export const routeMetricsSchema = z.object({
  totalDistance: z.number().min(0),
  totalElevationGain: z.number().min(0),
  totalElevationLoss: z.number().min(0),
  maxElevation: z.number(),
  minElevation: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  estimatedDuration: z.number().min(0).optional(),
  estimatedCalories: z.number().min(0).optional(),
  difficultyRating: z.number().min(1).max(5).optional(),
});

/**
 * Schema for a notification
 */
export const notificationSchema = z.object({
  id: z.string(),
  type: z.enum(['success', 'error', 'info', 'warning']),
  message: z.string(),
  duration: z.number().optional(),
  title: z.string().optional(),
  actionText: z.string().optional(),
  onAction: z.function().optional(),
  onDismiss: z.function().optional(),
});

/**
 * Schema for map viewport
 */
export const mapViewportSchema = z.object({
  center: z.tuple([z.number(), z.number()]),
  zoom: z.number().min(0).max(20),
  rotation: z.number().optional(),
  pitch: z.number().optional(),
});

/**
 * Schema for map marker
 */
export const mapMarkerSchema = z.object({
  id: z.string(),
  position: z.tuple([z.number(), z.number()]),
  label: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  size: z.enum(['small', 'medium', 'large']).optional(),
  data: z.record(z.unknown()).optional(),
});

/**
 * Schema for map layer
 */
export const mapLayerSchema = z.object({
  id: z.string(),
  type: z.enum(['tile', 'vector', 'heatmap', 'cluster']),
  source: z.string(),
  visible: z.boolean(),
  opacity: z.number().min(0).max(1),
  zIndex: z.number(),
  style: z.record(z.unknown()).optional(),
});

/**
 * Schema for export format
 */
export const exportFormatSchema = z.enum(['pdf', 'png', 'jpg', 'svg', 'csv', 'json', 'gpx']);

/**
 * Schema for weather provider
 */
export const weatherProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().url(),
  apiKey: z.string().optional(),
  enabled: z.boolean(),
  logoUrl: z.string().url().optional(),
  attribution: z.string().optional(),
  pricingTier: z.enum(['free', 'basic', 'premium', 'enterprise']).optional(),
  rateLimit: z
    .object({
      maxRequests: z.number().min(1),
      timeWindow: z.number().min(1000),
    })
    .optional(),
});

// Export types derived from schemas
export type GPXPoint = z.infer<typeof gpxPointSchema>;
export type GPXData = z.infer<typeof gpxDataSchema>;
export type ForecastPoint = z.infer<typeof forecastPointSchema>;
export type WeatherData = z.infer<typeof weatherDataSchema>;
export type RouteSettings = z.infer<typeof routeSettingsSchema>;
export type RouteMetrics = z.infer<typeof routeMetricsSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type MapViewport = z.infer<typeof mapViewportSchema>;
export type MapMarker = z.infer<typeof mapMarkerSchema>;
export type MapLayer = z.infer<typeof mapLayerSchema>;
export type ExportFormat = z.infer<typeof exportFormatSchema>;
export type WeatherProvider = z.infer<typeof weatherProviderSchema>;
