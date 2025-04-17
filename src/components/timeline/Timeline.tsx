'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Thermometer, Droplets, Wind, Cloud, CloudRain, CloudSnow, CloudFog, Sun, CloudLightning, HelpCircle, Gauge } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatTemperature, formatWindSpeed } from '@/utils/formatters';
import { responsive } from '@/styles/tailwind-utils';

interface TimelineProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onTimelineClick?: (index: number) => void;
  className?: string;
  timelineRef?: React.RefObject<HTMLDivElement | null>;
}

export function Timeline({
  forecastPoints,
  weatherData,
  selectedMarker,
  onTimelineClick,
  className,
  timelineRef,
}: TimelineProps) {
  const setScrollPosition = useState(0)[1];
  const localTimelineRef = useRef<HTMLDivElement>(null);
  const containerRef = timelineRef || localTimelineRef;

  // Scroll to selected marker when it changes
  useEffect(() => {
    if (selectedMarker !== null && containerRef.current) {
      const timelineItems = containerRef.current.querySelectorAll('.timeline-item');
      if (timelineItems[selectedMarker]) {
        const item = timelineItems[selectedMarker] as HTMLElement;
        const container = containerRef.current;

        // Calculate the scroll position to center the selected item
        const itemLeft = item.offsetLeft;
        const itemWidth = item.offsetWidth;
        const containerWidth = container.offsetWidth;
        const scrollLeft = itemLeft - containerWidth / 2 + itemWidth / 2;

        // Smooth scroll to the position
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  }, [selectedMarker, containerRef]);

  // Handle scroll event
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollLeft);
  };

  // Handle timeline item click
  const handleItemClick = (index: number) => {
    if (onTimelineClick) {
      onTimelineClick(index);
    }
  };

  // Scroll functionality is handled by the parent component (ClientSideTimeline)

  // Get weather icon based on weather code
  const getWeatherIcon = (weatherCode: number) => {
    // Simple mapping of weather codes to icons and colors
    if (weatherCode >= 200 && weatherCode < 300) {
      return <CloudLightning className="h-8 w-8 sm:h-10 sm:w-10 text-amber-500" />; // Thunderstorm
    }
    if (weatherCode >= 300 && weatherCode < 400) {
      return <CloudRain className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400" />; // Drizzle
    }
    if (weatherCode >= 500 && weatherCode < 600) {
      return <CloudRain className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />; // Rain
    }
    if (weatherCode >= 600 && weatherCode < 700) {
      return <CloudSnow className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-500" />; // Snow
    }
    if (weatherCode >= 700 && weatherCode < 800) {
      return <CloudFog className="h-8 w-8 sm:h-10 sm:w-10 text-zinc-400" />; // Atmosphere (fog, mist, etc.)
    }
    if (weatherCode === 800) {
      return <Sun className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500" />; // Clear
    }
    if (weatherCode > 800) {
      return <Cloud className="h-8 w-8 sm:h-10 sm:w-10 text-zinc-500" />; // Clouds
    }
    return <Thermometer className="h-8 w-8 sm:h-10 sm:w-10 text-rose-500" />; // Default
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Timeline container */}
      <div
        ref={containerRef}
        className={cn(
          responsive.scrollContainer,
          "pb-6 hide-scrollbar border-b border-zinc-200 dark:border-zinc-800 shadow-sm",
          "rounded-b-lg transition-all duration-200",
          "h-full overflow-y-hidden"
        )}
        onScroll={handleScroll}
      >
        <div className="flex items-stretch gap-2 px-2 sm:px-4 md:px-6 min-w-max pb-4 pt-2 h-full overflow-x-auto snap-x scroll-smooth">
          {forecastPoints.map((point, index) => {
            const weather = weatherData[index];
            const isSelected = index === selectedMarker;

            return (
              <div
                key={`timeline-${index}`}
                className={cn(
                  "timeline-item flex flex-col items-center p-3 rounded-xl",
                  "transition-all duration-200 ease-in-out cursor-pointer h-auto min-h-[350px] sm:min-h-[400px] md:min-h-[430px] lg:min-h-[450px]",
                  "border border-transparent w-[200px] sm:w-[220px] md:w-[240px] lg:w-[260px]",
                  "flex-shrink-0 snap-center",
                  isSelected
                    ? "bg-primary/10 border-primary/30 shadow-md ring-1 ring-primary/20 ring-inset"
                    : "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 hover:shadow-sm active:scale-[0.98]"
                )}
                onClick={() => handleItemClick(index)}
              >
                {/* Time */}
                <div className={cn(
                  "flex items-center justify-center w-full",
                  "text-xs sm:text-sm font-medium mb-2 py-1 px-2 rounded-md",
                  isSelected ? "bg-primary/10" : "bg-zinc-100/80 dark:bg-zinc-800/50"
                )}>
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
                  <span>{formatTime(point.timestamp)}</span>
                </div>

                {/* Weather icon */}
                <div className="my-2 sm:my-3 p-2 sm:p-3 rounded-full bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center shadow-sm">
                  {weather ? getWeatherIcon(weather.weatherCode) : <HelpCircle className="h-8 w-8 sm:h-10 sm:w-10 text-zinc-400" />}
                </div>

                {/* Weather data section */}
                <div className="space-y-2 sm:space-y-2.5 w-full mt-2 flex-1 overflow-y-auto">
                  {/* Temperature */}
                  {weather && (
                    <div className="flex items-start text-xs sm:text-sm">
                      <Thermometer className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 mt-0.5 text-rose-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-xs sm:text-sm">{formatTemperature(weather.temperature)}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs">Feels like: {formatTemperature(weather.feelsLike)}</div>
                      </div>
                    </div>
                  )}

                  {/* Precipitation */}
                  {weather && (
                    <div className="flex items-start text-xs sm:text-sm">
                      <Droplets className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 mt-0.5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-xs sm:text-sm">{weather.precipitation.toFixed(1)}mm</div>
                        <div className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">{(weather.precipitationProbability * 100).toFixed(0)}% chance</div>
                      </div>
                    </div>
                  )}

                  {/* Wind */}
                  {weather && (
                    <div className="flex items-start text-xs sm:text-sm">
                      <Wind className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 mt-0.5 text-emerald-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-xs sm:text-sm">{formatWindSpeed(weather.windSpeed)}</div>
                        <div className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Dir: {weather.windDirection}°</div>
                      </div>
                    </div>
                  )}

                  {/* Humidity */}
                  {weather && (
                    <div className="flex items-start text-xs sm:text-sm">
                      <Droplets className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 mt-0.5 text-blue-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-xs sm:text-sm">{weather.humidity}% humidity</div>
                      </div>
                    </div>
                  )}

                  {/* Pressure */}
                  {weather && (
                    <div className="flex items-start text-xs sm:text-sm">
                      <Gauge className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 mt-0.5 text-purple-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-xs sm:text-sm">{weather.pressure} hPa</div>
                      </div>
                    </div>
                  )}

                  {/* UV Index */}
                  {weather && weather.uvIndex !== undefined && (
                    <div className="flex items-start text-xs sm:text-sm">
                      <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-xs sm:text-sm">UV: {weather.uvIndex.toFixed(1)}</div>
                        <div className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                          {weather.uvIndex < 3 ? 'Low' :
                           weather.uvIndex < 6 ? 'Moderate' :
                           weather.uvIndex < 8 ? 'High' :
                           weather.uvIndex < 11 ? 'Very High' : 'Extreme'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cloud Cover */}
                  {weather && weather.clouds !== undefined && (
                    <div className="flex items-start text-xs sm:text-sm">
                      <Cloud className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 mt-0.5 text-zinc-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-xs sm:text-sm">{weather.clouds}% clouds</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Distance marker - removed as requested */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Timeline;
