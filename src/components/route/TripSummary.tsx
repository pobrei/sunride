'use client';

import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Route,
  Timer,
  ArrowUp,
  ArrowDown,
  Thermometer,
  Wind,
  CloudRain,
  Sun,
  AlertTriangle,
} from 'lucide-react';
import { formatDistance, formatDuration, formatTemperature } from '@/utils/formatters';
import { cva } from 'class-variance-authority';
import { cn } from '@/styles/tailwind-utils';

interface TripSummaryProps {
  /** GPX data containing route points */
  gpxData: GPXData | null;
  /** Forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Optional className for styling */
  className?: string;
}

/**
 * A component that displays a summary of the trip
 */
export function TripSummary({ gpxData, forecastPoints, weatherData, className }: TripSummaryProps) {
  if (!gpxData || !forecastPoints.length || !weatherData.length) {
    return null;
  }

  // Calculate trip statistics
  const tripDistance = gpxData.totalDistance;
  const tripDuration =
    forecastPoints[forecastPoints.length - 1].timestamp - forecastPoints[0].timestamp;
  const elevationGain = gpxData.elevationGain;
  const elevationLoss = gpxData.elevationLoss;

  // Calculate weather statistics
  const temperatures = weatherData
    .filter((w): w is WeatherData => w !== null)
    .map(w => w.temperature);

  const avgTemperature = temperatures.length
    ? temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length
    : 0;

  const maxTemperature = temperatures.length ? Math.max(...temperatures) : 0;

  const minTemperature = temperatures.length ? Math.min(...temperatures) : 0;

  // Calculate precipitation probability
  const precipitationPoints = weatherData.filter(
    (w): w is WeatherData => w !== null && w.precipitation > 0.2
  ).length;

  const precipitationChance = precipitationPoints / weatherData.length;

  // Calculate wind statistics
  const windSpeeds = weatherData.filter((w): w is WeatherData => w !== null).map(w => w.windSpeed);

  const avgWindSpeed = windSpeeds.length
    ? windSpeeds.reduce((sum, speed) => sum + speed, 0) / windSpeeds.length
    : 0;

  // Count alerts
  const alerts = {
    extremeHeat: weatherData.filter((w): w is WeatherData => w !== null && w.temperature > 35)
      .length,
    freezing: weatherData.filter((w): w is WeatherData => w !== null && w.temperature < 0).length,
    highWind: weatherData.filter((w): w is WeatherData => w !== null && w.windSpeed > 30).length,
    heavyRain: weatherData.filter((w): w is WeatherData => w !== null && w.precipitation > 0.5)
      .length,
  };

  const totalAlerts = alerts.extremeHeat + alerts.freezing + alerts.highWind + alerts.heavyRain;

  // Calculate temperature indicator position
  const tempIndicatorPosition = (() => {
    const position = ((avgTemperature - minTemperature) / (maxTemperature - minTemperature)) * 100;
    return {
      0: 'left-0',
      10: 'left-[10%]',
      20: 'left-[20%]',
      30: 'left-[30%]',
      40: 'left-[40%]',
      50: 'left-[50%]',
      60: 'left-[60%]',
      70: 'left-[70%]',
      80: 'left-[80%]',
      90: 'left-[90%]',
      100: 'left-[100%]',
    }[Math.round(position / 10) * 10] || 'left-[50%]';
  })();

  return (
    <Card className={cn('overflow-hidden border-primary/10', className)}>
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          Trip Summary
          {totalAlerts > 0 && (
            <Badge variant="warning" className="ml-2">
              {totalAlerts} Alert{totalAlerts !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Distance */}
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
              <MapPin className="h-3 w-3 text-primary" />
              Distance
            </div>
            <div className="text-lg font-medium">{formatDistance(tripDistance)}</div>
          </div>

          {/* Duration */}
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
              <Timer className="h-3 w-3 text-primary" />
              Duration
            </div>
            <div className="text-lg font-medium">{formatDuration(tripDuration)}</div>
          </div>

          {/* Elevation */}
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
              <ArrowUp className="h-3 w-3 text-primary" />
              Elevation Gain
            </div>
            <div className="text-lg font-medium">{Math.round(elevationGain)}m</div>
          </div>

          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
              <ArrowDown className="h-3 w-3 text-primary" />
              Elevation Loss
            </div>
            <div className="text-lg font-medium">{Math.round(elevationLoss)}m</div>
          </div>

          {/* Weather */}
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
              <Thermometer className="h-3 w-3 text-primary" />
              Avg Temperature
            </div>
            <div className="text-lg font-medium">{formatTemperature(avgTemperature)}</div>
          </div>

          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
              <Wind className="h-3 w-3 text-primary" />
              Avg Wind
            </div>
            <div className="text-lg font-medium">{Math.round(avgWindSpeed)} km/h</div>
          </div>

          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
              <CloudRain className="h-3 w-3 text-primary" />
              Rain Chance
            </div>
            <div className="text-lg font-medium">{Math.round(precipitationChance * 100)}%</div>
          </div>

          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3 text-primary" />
              Weather Alerts
            </div>
            <div className="text-lg font-medium">{totalAlerts}</div>
          </div>
        </div>

        {/* Temperature range */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Sun className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Temperature Range</span>
            </div>
            <div className="text-sm">
              <span className="text-blue-500 font-medium">{formatTemperature(minTemperature)}</span>
              {' — '}
              <span className="text-red-500 font-medium">{formatTemperature(maxTemperature)}</span>
            </div>
          </div>

          {/* Temperature range visualization */}
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-blue-500 to-red-500 rounded-full"
            />
            <div
              className={cn(
                "absolute inset-y-0 w-1 bg-white rounded-full -translate-x-1/2",
                tempIndicatorPosition
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
