/**
 * Common types used throughout the application
 */

/**
 * Represents a point on a route with geographical coordinates and elevation
 */
export interface RoutePoint {
  lat: number;
  lon: number;
  elevation: number;
  time?: Date;
  distance: number; // Distance from start in km
}

/**
 * Represents the parsed GPX data with route information
 */
export interface GPXData {
  name: string;
  points: RoutePoint[];
  totalDistance: number; // in km
  elevationGain: number; // in meters
  elevationLoss: number; // in meters
  maxElevation: number; // in meters
  minElevation: number; // in meters
}

/**
 * Represents a point along the route where weather forecast is needed
 */
export interface ForecastPoint {
  lat: number;
  lon: number;
  timestamp: number; // Unix timestamp
  distance: number; // Distance from start in km
}

/**
 * Represents weather data for a specific point and time
 */
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  rain: number;
  snow?: number;
  weatherIcon: string;
  weatherDescription: string;
  uvIndex?: number;
  windGust?: number;
  precipitationProbability?: number;
  precipitation?: number;
}

/**
 * Settings for route processing
 */
export interface RouteSettings {
  weatherInterval: number; // in km
  startTime: Date;
  avgSpeed: number; // in km/h
}

/**
 * Custom error types for better error handling
 */
export class APIError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
