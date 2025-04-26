'use client';

import React, { useMemo } from 'react';
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
import { cn } from '@/lib/utils';
import { chartTheme } from '@/components/charts/chart-theme';

/**
 * Props for the ModernTripSummary component
 */
interface ModernTripSummaryProps {
  /** GPX data containing route information */
  gpxData: GPXData | null;
  /** Array of forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Additional class names */
  className?: string;
}

/**
 * ModernTripSummary component displays a summary of the trip including weather statistics,
 * alerts, and elevation data with a modern iOS 19-inspired design.
 */
const ModernTripSummary: React.FC<ModernTripSummaryProps> = ({
  gpxData,
  forecastPoints,
  weatherData,
  className,
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

  // Calculate headwind hours (simplified - assuming route direction is constant)
  let headwindHours: number = 0;
  if (forecastPoints.length >= 2) {
    // Calculate overall route direction
    const startPoint: ForecastPoint = forecastPoints[0];
    const endPoint: ForecastPoint = forecastPoints[forecastPoints.length - 1];
    const routeDirection: number =
      Math.atan2(endPoint.lat - startPoint.lat, endPoint.lon - startPoint.lon) * (180 / Math.PI);

    // Count points where wind direction is opposite to route direction (±45°)
    const headwindPoints: WeatherData[] = validWeatherData.filter(data => {
      const windDirection: number = data.windDirection;
      const directionDiff: number = Math.abs(windDirection - routeDirection);
      return directionDiff > 135 && directionDiff < 225;
    });

    headwindHours = Math.round(
      headwindPoints.length * (estimatedDuration / validWeatherData.length)
    );
  }

  // Count and categorize weather alerts
  interface WeatherAlerts {
    extremeHeat: number;
    freezing: number;
    highWind: number;
    heavyRain: number;
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

  // Temperature range visualization data
  const temperatureRange = useMemo(() => {
    const range = maxTemperature - minTemperature;
    const segments = 10; // Number of segments in the visualization
    const segmentWidth = range / segments;
    
    return {
      range,
      segments,
      segmentWidth,
      min: minTemperature,
      max: maxTemperature,
      avg: avgTemperature
    };
  }, [minTemperature, maxTemperature, avgTemperature]);

  // Get theme colors
  const isDarkMode = typeof window !== 'undefined' ? 
    window.matchMedia('(prefers-color-scheme: dark)').matches : false;
  const theme = isDarkMode ? chartTheme.dark : chartTheme.light;

  return (
    <Card 
      className={cn(
        "overflow-hidden rounded-xl shadow-sm animate-fade-in",
        "bg-white/30 dark:bg-card/30 backdrop-blur-sm border border-border/20",
        className
      )}
      variant="glass"
      size="sm"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Trip Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Distance */}
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="font-medium text-sm">{formatDistance(totalDistance * 1000)}</p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-medium text-sm">{formatDuration(estimatedDuration)}</p>
            </div>
          </div>

          {/* Elevation */}
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Mountain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Elevation</p>
              <p className="font-medium text-sm">
                +{Math.round(elevationGain)}m / -{Math.round(elevationLoss)}m
              </p>
            </div>
          </div>

          {/* Temperature */}
          <div className="flex items-center gap-2">
            <div className="bg-rose-500/10 p-2 rounded-full">
              <Thermometer className="h-4 w-4 text-rose-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Temperature</p>
              <p className="font-medium text-sm">
                {avgTemperature}°C ({minTemperature}°C - {maxTemperature}°C)
              </p>
            </div>
          </div>

          {/* Wind */}
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-2 rounded-full">
              <Wind className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wind</p>
              <p className="font-medium text-sm">
                {avgWindSpeed} m/s (max: {maxWindSpeed} m/s)
              </p>
            </div>
          </div>

          {/* Headwind */}
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-2 rounded-full">
              <Wind className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Headwind</p>
              <p className="font-medium text-sm">~{headwindHours} hours</p>
            </div>
          </div>

          {/* Rain Chance */}
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500/10 p-2 rounded-full">
              <Droplets className="h-4 w-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rain Chance</p>
              <p className="font-medium text-sm">{rainChance}%</p>
            </div>
          </div>

          {/* Humidity */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/10 p-2 rounded-full">
              <Cloud className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="font-medium text-sm">{avgHumidity}%</p>
            </div>
          </div>

          {/* UV Index */}
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/10 p-2 rounded-full">
              <Sun className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Max UV Index</p>
              <p className="font-medium text-sm">
                {maxUvIndex} {maxUvIndex > 7 ? '(High)' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Weather Alerts - Compact Version */}
        {totalAlerts > 0 && (
          <div className="flex items-center gap-2">
            <div className="bg-red-500/10 p-2 rounded-full">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Weather Alerts</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {weatherAlerts.extremeHeat > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
                    <Thermometer className="h-3 w-3 mr-1" /> Heat: {weatherAlerts.extremeHeat}
                  </span>
                )}
                {weatherAlerts.freezing > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                    <Thermometer className="h-3 w-3 mr-1" /> Freezing: {weatherAlerts.freezing}
                  </span>
                )}
                {weatherAlerts.highWind > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                    <Wind className="h-3 w-3 mr-1" /> Wind: {weatherAlerts.highWind}
                  </span>
                )}
                {weatherAlerts.heavyRain > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                    <Droplets className="h-3 w-3 mr-1" /> Rain: {weatherAlerts.heavyRain}
                  </span>
                )}
                {weatherAlerts.highUV > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                    <Sun className="h-3 w-3 mr-1" /> UV: {weatherAlerts.highUV}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Temperature Range Visualization */}
        <div className="mt-2 pt-2 border-t border-border/20">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Temperature Range</p>
            <p className="text-xs font-medium">
              <span className="text-blue-500">{minTemperature}°C</span> - 
              <span className="text-rose-500 ml-1">{maxTemperature}°C</span>
            </p>
          </div>
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
            {Array.from({ length: temperatureRange.segments }).map((_, i) => {
              // Calculate temperature for this segment
              const segTemp = minTemperature + (i * temperatureRange.segmentWidth);
              
              // Determine color based on temperature
              let bgColor = '';
              if (segTemp < 0) bgColor = 'bg-blue-500';
              else if (segTemp < 10) bgColor = 'bg-blue-400';
              else if (segTemp < 20) bgColor = 'bg-green-400';
              else if (segTemp < 30) bgColor = 'bg-yellow-400';
              else bgColor = 'bg-rose-500';
              
              return (
                <div 
                  key={`temp-seg-${i}`} 
                  className={`h-full flex-1 ${bgColor}`}
                  style={{ 
                    opacity: 0.7 + (i / temperatureRange.segments) * 0.3 
                  }}
                />
              );
            })}
          </div>
          
          {/* Average temperature marker */}
          <div className="relative h-0">
            <div 
              className="absolute top-[-12px] w-1 h-4 bg-white border border-gray-400 rounded-sm"
              style={{ 
                left: `${((avgTemperature - minTemperature) / temperatureRange.range) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            />
          </div>
          
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-blue-500 font-medium">Cold</span>
            <span className="text-[10px] text-rose-500 font-medium">Hot</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernTripSummary;
