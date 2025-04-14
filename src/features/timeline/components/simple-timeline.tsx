'use client';

import React from 'react';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatTemperature } from '@/utils/formatUtils';

interface SimpleTimelineProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onTimelineClick: (index: number) => void;
}

export default function SimpleTimeline(props: SimpleTimelineProps) {
  const { forecastPoints, weatherData, selectedMarker, onTimelineClick } = props;

  // If no forecast points, show a message
  if (!forecastPoints || forecastPoints.length === 0 || !weatherData || weatherData.length === 0) {
    return (
      <div className="h-[150px] bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            No forecast data available
          </p>
        </div>
      </div>
    );
  }

  // Render a simple timeline representation
  return (
    <div className="h-[150px] bg-muted p-4 overflow-x-auto">
      <div className="flex items-center h-full space-x-2 min-w-max">
        {forecastPoints.map((point, index) => {
          const weather = weatherData[index];
          if (!weather) return null;

          const isSelected = selectedMarker === index;

          return (
            <div
              key={index}
              className={`flex flex-col items-center justify-center h-full p-2 rounded cursor-pointer transition-colors min-w-timeline-item ${
                isSelected ? 'bg-primary/10 border border-primary' : 'hover:bg-background/50'
              }`}
              onClick={() => onTimelineClick(index)}
            >
              <div className="text-xs font-medium">{formatTime(point.timestamp)}</div>
              <div className="text-xs text-muted-foreground">Point {index + 1}</div>
              {weather.temperature !== undefined && (
                <div className="text-sm font-semibold mt-1">
                  {formatTemperature(weather.temperature)}
                </div>
              )}
              {weather.precipitation !== undefined && (
                <div className="text-xs text-muted-foreground">
                  {weather.precipitation > 0
                    ? `${weather.precipitation.toFixed(1)} mm`
                    : 'No rain'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
