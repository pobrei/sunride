'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { formatTime, formatTemperature } from '@/utils/formatters';
import { ForecastPoint, WeatherData } from '@/types';

// Helper function to convert wind direction degrees to cardinal directions
const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

interface TimelineItemProps {
  /** Forecast point data */
  point: ForecastPoint;
  /** Weather data for this point */
  weather: WeatherData | null;
  /** Whether this item is selected */
  isSelected: boolean;
  /** Callback when the item is clicked */
  onClick: () => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * A timeline item component that displays weather data for a specific point
 * Used by ModernTimeline component
 */
export function TimelineItem({
  point,
  weather,
  isSelected,
  onClick,
  className,
}: TimelineItemProps) {
  if (!weather) return null;

  return (
    <div
      className={cn(
        "timeline-item flex flex-col p-3 rounded-xl transition-all duration-200",
        "w-[140px] sm:w-[150px] md:w-[160px] lg:w-[170px] flex-shrink-0 cursor-pointer",
        "h-[380px] sm:h-[400px] md:h-[420px] lg:h-[440px]", // Increased height to ensure all content fits
        "mx-auto", // Center horizontally
        isSelected
          ? "bg-primary/5 dark:bg-primary/10 shadow-md border border-primary/30"
          : "bg-card/90 backdrop-blur-sm hover:bg-card/95 hover:shadow-sm border border-border/20",
        className
      )}
      onClick={onClick}
    >
      {/* Time */}
      <div className="text-xs font-semibold text-center mb-2 bg-primary/5 dark:bg-primary/10 py-1 px-2 rounded-md text-primary dark:text-primary/90 border border-primary/10">
        {formatTime(point.timestamp)}
      </div>

      {/* Temperature */}
      <div className={cn(
        "flex flex-col items-center justify-center py-2 px-1 rounded-lg mb-2",
        "bg-rose-50/50 dark:bg-rose-900/10 backdrop-blur-sm",
        "border border-rose-100 dark:border-rose-900/20"
      )}>
        <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
          {formatTemperature(weather.temperature)}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          Feels like: {formatTemperature(weather.feelsLike)}
        </div>
      </div>

      {/* Weather details */}
      <div className="timeline-details-container flex flex-col gap-2 flex-1 overflow-y-auto px-1 py-2 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent max-h-[240px] sm:max-h-[260px] md:max-h-[280px] lg:max-h-[300px] relative">
        {/* Scroll indicators */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-card/80 to-transparent pointer-events-none z-10"></div>
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-card/80 to-transparent pointer-events-none z-10"></div>

        {/* Wind */}
        <div className="timeline-detail-item flex justify-between items-center py-2 px-2.5 mx-auto rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 backdrop-blur-sm border border-emerald-100 dark:border-emerald-900/20 text-[10px] w-full">
          <span className="text-muted-foreground">Wind</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {(weather.windSpeed / 3.6).toFixed(1)} m/s
            <span className="ml-1 text-muted-foreground">
              {getWindDirection(weather.windDirection)}
            </span>
          </span>
        </div>

        {/* Humidity */}
        <div className="timeline-detail-item flex justify-between items-center py-2 px-2.5 mx-auto rounded-lg bg-blue-50/50 dark:bg-blue-900/10 backdrop-blur-sm border border-blue-100 dark:border-blue-900/20 text-[10px] w-full">
          <span className="text-muted-foreground">Humidity</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">{weather.humidity}%</span>
        </div>

        {/* Precipitation */}
        <div className="timeline-detail-item flex justify-between items-center py-2 px-2.5 mx-auto rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 backdrop-blur-sm border border-indigo-100 dark:border-indigo-900/20 text-[10px] w-full">
          <span className="text-muted-foreground">Precip.</span>
          <span className="font-medium text-indigo-600 dark:text-indigo-400">{weather.precipitation?.toFixed(1) || '0'}mm</span>
        </div>

        {/* UV Index */}
        {weather.uvIndex !== undefined && (
          <div className="timeline-detail-item flex justify-between items-center py-2 px-2.5 mx-auto rounded-lg bg-amber-50/50 dark:bg-amber-900/10 backdrop-blur-sm border border-amber-100 dark:border-amber-900/20 text-[10px] w-full">
            <span className="text-muted-foreground">UV Index</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">{weather.uvIndex?.toFixed(1) || 'N/A'}</span>
          </div>
        )}

        {/* Pressure */}
        <div className="timeline-detail-item flex justify-between items-center py-2 px-2.5 mx-auto rounded-lg bg-purple-50/50 dark:bg-purple-900/10 backdrop-blur-sm border border-purple-100 dark:border-purple-900/20 text-[10px] w-full">
          <span className="text-muted-foreground">Pressure</span>
          <span className="font-medium text-purple-600 dark:text-purple-400">{weather.pressure} hPa</span>
        </div>

        {/* Cloud Cover */}
        {weather.cloudCover !== undefined && (
          <div className="timeline-detail-item flex justify-between items-center py-2 px-2.5 mx-auto rounded-lg bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-100 dark:border-slate-800/50 text-[10px] w-full">
            <span className="text-muted-foreground">Clouds</span>
            <span className="font-medium text-slate-600 dark:text-slate-300">{weather.cloudCover}%</span>
          </div>
        )}

        {/* Extra padding at the bottom to ensure last item is fully visible when scrolled */}
        <div className="h-8 w-full flex-shrink-0"></div>
      </div>

      {/* Distance */}
      <div className="text-[9px] text-center bg-gray-50/50 dark:bg-gray-800/20 rounded-md py-1 px-2 mt-1 font-medium text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800/30">
        Distance: {point.distance.toFixed(1)} km
      </div>
    </div>
  );
}

export default TimelineItem;
