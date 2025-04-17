'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Thermometer, Droplets, Wind } from 'lucide-react';

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
  timelineRef?: React.RefObject<HTMLDivElement>;
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
    // Simple mapping of weather codes to icons
    if (weatherCode >= 200 && weatherCode < 300) return '⛈️'; // Thunderstorm
    if (weatherCode >= 300 && weatherCode < 400) return '🌧️'; // Drizzle
    if (weatherCode >= 500 && weatherCode < 600) return '🌧️'; // Rain
    if (weatherCode >= 600 && weatherCode < 700) return '❄️'; // Snow
    if (weatherCode >= 700 && weatherCode < 800) return '🌫️'; // Atmosphere (fog, mist, etc.)
    if (weatherCode === 800) return '☀️'; // Clear
    if (weatherCode > 800) return '☁️'; // Clouds
    return '🌡️'; // Default
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Timeline container */}
      <div
        ref={containerRef}
        className={cn(responsive.scrollContainer, "pb-8 hide-scrollbar border-b-2 border-black/20 dark:border-white/20")}
        onScroll={handleScroll}
      >
        <div className="flex items-stretch space-x-1 px-8 min-w-max pb-4">
          {forecastPoints.map((point, index) => {
            const weather = weatherData[index];
            const isSelected = index === selectedMarker;

            return (
              <div
                key={`timeline-${index}`}
                className={cn(
                  "timeline-item flex flex-col items-center p-2 pb-4 rounded-lg transition-all duration-200 ease-in-out cursor-pointer h-auto", responsive.timelineItem,
                  isSelected
                    ? "bg-primary/10 border border-primary/30 shadow-md"
                    : "hover:bg-muted/50 hover:shadow active:scale-[0.98]"
                )}
                onClick={() => handleItemClick(index)}
              >
                {/* Time */}
                <div className="flex items-center text-sm font-medium mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTime(point.timestamp)}
                </div>

                {/* Weather icon */}
                <div className="text-3xl my-3">
                  {weather ? getWeatherIcon(weather.weatherCode) : '❓'}
                </div>

                {/* Weather data section */}
                <div className="space-y-3 w-full">
                  {/* Temperature */}
                  {weather && (
                    <div className="flex items-center text-sm font-medium">
                      <Thermometer className="h-4 w-4 mr-1 text-rose-500" />
                      <div>
                        <div>{formatTemperature(weather.temperature)}</div>
                        <div className="text-xs text-muted-foreground">Feels like: {formatTemperature(weather.feelsLike)}</div>
                      </div>
                    </div>
                  )}

                  {/* Precipitation */}
                  {weather && (
                    <div className="flex items-center text-sm">
                      <Droplets className="h-4 w-4 mr-1 text-blue-500" />
                      <div>
                        <div>{weather.precipitation.toFixed(1)}mm</div>
                        <div className="text-xs text-muted-foreground">{(weather.precipitationProbability * 100).toFixed(0)}% chance</div>
                      </div>
                    </div>
                  )}

                  {/* Wind */}
                  {weather && (
                    <div className="flex items-center text-sm">
                      <Wind className="h-4 w-4 mr-1 text-emerald-500" />
                      <div>
                        <div>{formatWindSpeed(weather.windSpeed)}</div>
                        <div className="text-xs text-muted-foreground">Dir: {weather.windDirection}°</div>
                      </div>
                    </div>
                  )}

                  {/* Humidity */}
                  {weather && (
                    <div className="flex items-center text-sm">
                      <div className="h-4 w-4 mr-1 flex items-center justify-center text-blue-400">💧</div>
                      <div>
                        <div>{weather.humidity}% humidity</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Distance marker */}
                <div className="flex items-center text-xs text-muted-foreground mt-3 mb-1 font-medium distance-marker">
                  <MapPin className="h-3 w-3 mr-1" />
                  {(point.distance).toFixed(1)}km
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Timeline;
