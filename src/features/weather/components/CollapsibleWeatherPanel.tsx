'use client';

import React, { useState } from 'react';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatTemperature, formatWind, formatPrecipitation } from '@/utils/formatUtils';

interface CollapsibleWeatherPanelProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedPoint: number | null;
  onSelectPoint: (index: number | null) => void;
  className?: string;
}

/**
 * A collapsible panel that displays weather information for the selected point
 */
export default function CollapsibleWeatherPanel({
  forecastPoints,
  weatherData,
  selectedPoint,
  onSelectPoint,
  className,
}: CollapsibleWeatherPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If no point is selected or no data is available, don't render
  if (
    selectedPoint === null ||
    !forecastPoints[selectedPoint] ||
    !weatherData[selectedPoint]
  ) {
    return null;
  }

  const point = forecastPoints[selectedPoint];
  const weather = weatherData[selectedPoint] as WeatherData;

  return (
    <Card
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-border shadow-lg transition-all duration-300 ease-in-out',
        isCollapsed ? 'h-12' : 'h-auto max-h-[50vh] overflow-y-auto',
        className
      )}
    >
      {/* Header - always visible */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Weather at Point {selectedPoint + 1}</span>
          <span className="text-sm font-medium text-zinc-500">
            {formatTemperature(weather.temperature)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {isCollapsed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onSelectPoint(null)}
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content - only visible when expanded */}
      {!isCollapsed && (
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-500">Temperature</h4>
            <div className="text-lg font-semibold">{formatTemperature(weather.temperature)}</div>
            <div className="text-sm font-medium text-zinc-500">
              Feels like {formatTemperature(weather.feelsLike)}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-500">Wind</h4>
            <div className="text-lg font-semibold">{formatWind(weather.windSpeed)}</div>
            <div className="text-sm font-medium text-zinc-500">
              Direction: {weather.windDirection}°
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-500">Precipitation</h4>
            <div className="text-lg font-semibold">{formatPrecipitation(weather.precipitation)}</div>
            <div className="text-sm font-medium text-zinc-500">
              Humidity: {weather.humidity}%
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-zinc-500">Conditions</h4>
            <div className="text-lg font-semibold">{weather.weatherDescription}</div>
            <div className="text-sm font-medium text-zinc-500">
              Cloud cover: {weather.cloudCover}%
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
