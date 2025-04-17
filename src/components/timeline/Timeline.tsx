'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Thermometer, Droplets, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatTemperature, formatWindSpeed } from '@/utils/formatters';

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
  const [scrollPosition, setScrollPosition] = useState(0);
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
        className="overflow-x-auto pb-8 hide-scrollbar border-b-2 border-black/20 dark:border-white/20"
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
                  "timeline-item flex flex-col items-center p-2 pb-4 rounded-lg transition-all cursor-pointer min-w-[100px] h-auto",
                  isSelected
                    ? "bg-primary/10 border border-primary/30 shadow-md"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleItemClick(index)}
              >
                {/* Time */}
                <div className="flex items-center text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(point.timestamp)}
                </div>

                {/* Weather icon */}
                <div className="text-2xl my-2">
                  {weather ? getWeatherIcon(weather.weatherCode) : '❓'}
                </div>

                {/* Temperature */}
                {weather && (
                  <div className="flex items-center text-sm font-medium mb-1">
                    <Thermometer className="h-3 w-3 mr-1 text-rose-500" />
                    {formatTemperature(weather.temperature)}
                  </div>
                )}

                {/* Precipitation */}
                {weather && weather.precipitation > 0 && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Droplets className="h-3 w-3 mr-1 text-blue-500" />
                    {weather.precipitation.toFixed(1)}mm
                  </div>
                )}

                {/* Wind */}
                {weather && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Wind className="h-3 w-3 mr-1 text-emerald-500" />
                    {formatWindSpeed(weather.windSpeed)}
                  </div>
                )}

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
