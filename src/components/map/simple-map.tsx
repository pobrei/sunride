'use client';

import React from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { formatDistance, formatDateTime, formatTemperature } from '@/utils/formatUtils';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';

interface SimpleMapProps {
  gpxData: GPXData | null;
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  onMarkerClick: (index: number) => void;
  selectedMarker: number | null;
}

export default function SimpleMap({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker,
}: SimpleMapProps) {
  // Check if we have valid data
  const hasValidData =
    gpxData &&
    gpxData.points &&
    gpxData.points.length > 0 &&
    forecastPoints &&
    forecastPoints.length > 0 &&
    weatherData &&
    weatherData.length > 0;

  if (!hasValidData) {
    return (
      <div className="relative h-[500px] rounded-xl overflow-hidden border border-border bg-card card-shadow animate-fade-in transition-smooth">
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="p-6 rounded-xl bg-card shadow-lg text-center">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Map Unavailable</h3>
            <p className="text-muted-foreground mb-4">
              The interactive map is currently unavailable.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Please upload a GPX file to view route information.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Simplified map view - just show route stats and a list of points
  return (
    <div className="relative h-[500px] rounded-xl overflow-hidden border border-border bg-card card-shadow animate-fade-in transition-smooth">
      <div className="absolute top-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex flex-wrap gap-4 justify-between">
          <div>
            <h3 className="font-semibold">Route Information</h3>
            <p className="text-sm text-muted-foreground">
              {gpxData.name || 'Unnamed Route'} - {formatDistance(gpxData.distance || 0)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pt-16 pb-4 px-4 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {forecastPoints.map((point, index) => {
            const weather = weatherData[index];
            if (!point || !weather) return null;

            const isSelected = selectedMarker === index;

            return (
              <div
                key={index}
                className={`p-3 rounded-lg border ${isSelected ? 'border-primary bg-primary/10' : 'border-border'} cursor-pointer hover:bg-muted transition-colors`}
                onClick={() => onMarkerClick(index)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">Point {index + 1}</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Time: {formatDateTime(point.timestamp)}</p>
                  <p>Distance: {formatDistance(point.distance)}</p>
                  <p>
                    Coordinates: {point.lat.toFixed(5)}, {point.lon.toFixed(5)}
                  </p>
                  <p>Temperature: {formatTemperature(weather.temperature || 0)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/80 backdrop-blur-sm text-center text-xs text-muted-foreground">
        Interactive map is disabled to prevent errors. This is a simplified view of your route.
      </div>
    </div>
  );
}
