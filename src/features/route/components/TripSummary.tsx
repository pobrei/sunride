'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import { GPXData } from '@/features/gpx/types';
import {
  Cloud,
  Droplets,
  Wind,
  Sun,
  Thermometer,
  AlertTriangle,
  Clock,
  Mountain,
} from 'lucide-react';
import { formatDistance, formatDuration } from '@/utils/formatUtils';

/**
 * Props for the TripSummary component
 */
interface TripSummaryProps {
  /** GPX data containing route information */
  gpxData: GPXData | null;
  /** Array of forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
}

/**
 * TripSummary component displays a summary of the trip including weather statistics,
 * alerts, and elevation data.
 *
 * @param props - Component props
 * @returns React component
 */
const TripSummary: React.FC<TripSummaryProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
}): React.ReactElement | null => {
  if (!gpxData || !forecastPoints.length || !weatherData.length) {
    return null;
  }

  // Filter out null weather data
  const validWeatherData: WeatherData[] = weatherData.filter(
    (data): data is WeatherData => data !== null
  );

  if (validWeatherData.length === 0) {
    return null;
  }

  // Calculate trip statistics
  const totalDistance: number = gpxData.totalDistance;
  const estimatedDuration: number = gpxData.estimatedDuration;

  // Calculate weather statistics
  const avgTemperature: number = Math.round(
    validWeatherData.reduce((sum, data) => sum + data.temperature, 0) / validWeatherData.length
  );

  const maxTemperature: number = Math.round(
    Math.max(...validWeatherData.map(data => data.temperature))
  );

  const minTemperature: number = Math.round(
    Math.min(...validWeatherData.map(data => data.temperature))
  );

  const avgHumidity: number = Math.round(
    validWeatherData.reduce((sum, data) => sum + data.humidity, 0) / validWeatherData.length
  );

  const maxWindSpeed: number = Math.round(
    Math.max(...validWeatherData.map(data => data.windSpeed))
  );

  const avgWindSpeed: number = Math.round(
    validWeatherData.reduce((sum, data) => sum + data.windSpeed, 0) / validWeatherData.length
  );

  const rainyPoints: WeatherData[] = validWeatherData.filter(data => data.rain > 0);
  const rainChance: number = Math.round((rainyPoints.length / validWeatherData.length) * 100);

  const maxUvIndex: number = Math.max(...validWeatherData.map(data => data.uvIndex || 0));



  // Count and categorize weather alerts
  /**
   * Interface for weather alerts with counts of different alert types
   */
  interface WeatherAlerts {
    /** Count of extreme heat alerts (temperature > 35°C) */
    extremeHeat: number;
    /** Count of freezing alerts (temperature < 0°C) */
    freezing: number;
    /** Count of high wind alerts (wind speed > 15 m/s) */
    highWind: number;
    /** Count of heavy rain alerts (rain > 10mm) */
    heavyRain: number;
    /** Count of high UV alerts (UV index > 8) */
    highUV: number;
  }

  const weatherAlerts: WeatherAlerts = validWeatherData.reduce(
    (alerts, data) => {
      // Check for extreme conditions
      if (data.temperature > 35) alerts.extremeHeat++;
      if (data.temperature < 0) alerts.freezing++;
      if (data.windSpeed > 15) alerts.highWind++;
      if (data.rain > 10) alerts.heavyRain++;
      if (data.uvIndex && data.uvIndex > 8) alerts.highUV++;
      return alerts;
    },
    {
      extremeHeat: 0,
      freezing: 0,
      highWind: 0,
      heavyRain: 0,
      highUV: 0,
    }
  );

  // Total number of alerts
  const totalAlerts: number = Object.values(weatherAlerts).reduce((sum, count) => sum + count, 0);

  // Calculate elevation gain/loss
  const elevationGain: number = gpxData.elevation?.gain || 0;
  const elevationLoss: number = gpxData.elevation?.loss || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Trip Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Distance */}
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="font-medium">{formatDistance(totalDistance * 1000)}</p>
            </div>
          </div>



          {/* Elevation */}
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Mountain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Elevation</p>
              <p className="font-medium">
                +{Math.round(elevationGain)}m / -{Math.round(elevationLoss)}m
              </p>
            </div>
          </div>

          {/* Temperature */}
          <div className="flex items-center gap-2">
            <div className="bg-orange-500/10 p-2 rounded-full">
              <Thermometer className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="font-medium">
                {avgTemperature}°C (min: {minTemperature}°C, max: {maxTemperature}°C)
              </p>
            </div>
          </div>

          {/* Wind */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/10 p-2 rounded-full">
              <Wind className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wind</p>
              <p className="font-medium">
                {avgWindSpeed} m/s (max: {maxWindSpeed} m/s)
              </p>
            </div>
          </div>



          {/* Rain Chance */}
          <div className="flex items-center gap-2">
            <div className="bg-sky-500/10 p-2 rounded-full">
              <Droplets className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rain Chance</p>
              <p className="font-medium">{rainChance}%</p>
            </div>
          </div>

          {/* Humidity */}
          <div className="flex items-center gap-2">
            <div className="bg-sky-500/10 p-2 rounded-full">
              <Cloud className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Humidity</p>
              <p className="font-medium">{avgHumidity}%</p>
            </div>
          </div>

          {/* UV Index */}
          <div className="flex items-center gap-2">
            <div className="bg-yellow-500/10 p-2 rounded-full">
              <Sun className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max UV Index</p>
              <p className="font-medium">
                {maxUvIndex} {maxUvIndex > 7 ? '(High Protection Needed)' : ''}
              </p>
            </div>
          </div>

          {/* Weather Alerts - Compact Version */}
          <div className="flex items-center gap-2 col-span-2 md:col-span-3">
            <div className="bg-red-500/10 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Weather Alerts</p>
              {totalAlerts > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {weatherAlerts.extremeHeat > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      <Thermometer className="h-3 w-3 mr-1" /> Heat: {weatherAlerts.extremeHeat}
                    </span>
                  )}
                  {weatherAlerts.freezing > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Thermometer className="h-3 w-3 mr-1" /> Freezing: {weatherAlerts.freezing}
                    </span>
                  )}
                  {weatherAlerts.highWind > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                      <Wind className="h-3 w-3 mr-1" /> Wind: {weatherAlerts.highWind}
                    </span>
                  )}
                  {weatherAlerts.heavyRain > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      <Droplets className="h-3 w-3 mr-1" /> Rain: {weatherAlerts.heavyRain}
                    </span>
                  )}
                  {weatherAlerts.highUV > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      <Sun className="h-3 w-3 mr-1" /> UV: {weatherAlerts.highUV}
                    </span>
                  )}
                </div>
              ) : (
                <p className="font-medium text-green-600 dark:text-green-400">No weather alerts</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripSummary;
