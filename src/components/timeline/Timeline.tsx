'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Thermometer, Droplets, Wind, Cloud, CloudRain, CloudSnow, CloudFog, Sun, CloudLightning, HelpCircle, Gauge } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatTemperature, formatWindSpeed } from '@/utils/formatters';
import { responsive } from '@/styles/tailwind-utils';

// Helper function to convert wind direction degrees to cardinal directions
const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

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
    // SF Symbols style weather icons
    if (weatherCode >= 200 && weatherCode < 300) {
      return (
        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100/50 dark:border-amber-800/20">
          <svg className="h-8 w-8 text-amber-500" viewBox="0 0 24 24">
            <path d="M6 19a4 4 0 0 1 0-8h1a7 7 0 0 1 13 3 3 3 0 0 1-3 3h-11z" fill="currentColor" />
            <path d="M13 10l-2 4h3l-2 4" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      ); // Thunderstorm
    }
    if (weatherCode >= 300 && weatherCode < 400) {
      return (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100/50 dark:border-blue-800/20">
          <svg className="h-8 w-8 text-blue-400" viewBox="0 0 24 24">
            <path d="M6 19a4 4 0 0 1 0-8h1a7 7 0 0 1 13 3 3 3 0 0 1-3 3h-11z" fill="currentColor" />
            <path d="M8 19v2M12 19v2M16 19v2" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      ); // Drizzle
    }
    if (weatherCode >= 500 && weatherCode < 600) {
      return (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100/50 dark:border-blue-800/20">
          <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24">
            <path d="M6 19a4 4 0 0 1 0-8h1a7 7 0 0 1 13 3 3 3 0 0 1-3 3h-11z" fill="currentColor" />
            <path d="M8 19v2M12 19v2M16 19v2" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      ); // Rain
    }
    if (weatherCode >= 600 && weatherCode < 700) {
      return (
        <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-100/50 dark:border-cyan-800/20">
          <svg className="h-8 w-8 text-cyan-500" viewBox="0 0 24 24">
            <path d="M6 19a4 4 0 0 1 0-8h1a7 7 0 0 1 13 3 3 3 0 0 1-3 3h-11z" fill="currentColor" />
            <path d="M10 15l-1.5 1.6M15.5 15l-1.5 1.6M8.5 19l-1.5 1.6M12 19l-1.5 1.6M15.5 19l-1.5 1.6" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      ); // Snow
    }
    if (weatherCode >= 700 && weatherCode < 800) {
      return (
        <div className="p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100/50 dark:border-zinc-700/20">
          <svg className="h-8 w-8 text-zinc-400" viewBox="0 0 24 24">
            <path d="M6 19a4 4 0 0 1 0-8h1a7 7 0 0 1 13 3 3 3 0 0 1-3 3h-11z" fill="currentColor" opacity="0.7" />
            <path d="M4 14h16M8 10h12M6 6h10" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      ); // Atmosphere (fog, mist, etc.)
    }
    if (weatherCode === 800) {
      return (
        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100/50 dark:border-yellow-800/20">
          <svg className="h-8 w-8 text-yellow-500" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" fill="currentColor" />
            <path d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4l1.4-1.4M17 7l1.4-1.4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      ); // Clear
    }
    if (weatherCode > 800) {
      return (
        <div className="p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100/50 dark:border-zinc-700/20">
          <svg className="h-8 w-8 text-zinc-500" viewBox="0 0 24 24">
            <path d="M6 19a4 4 0 0 1 0-8h1a7 7 0 0 1 13 3 3 3 0 0 1-3 3h-11z" fill="currentColor" />
          </svg>
        </div>
      ); // Clouds
    }
    return (
      <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100/50 dark:border-rose-800/20">
        <svg className="h-8 w-8 text-rose-500" viewBox="0 0 24 24">
          <path d="M10 2h4v11.5a4 4 0 1 1-4 0V2z" fill="currentColor" />
          <circle cx="12" cy="17" r="3" fill="currentColor" />
        </svg>
      </div>
    ); // Default
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Timeline container */}
      <div
        ref={containerRef}
        className={cn(
          responsive.scrollContainer,
          "pb-6 hide-scrollbar border-b border-border/30",
          "h-full overflow-y-hidden rounded-2xl"
        )}
        onScroll={handleScroll}
      >
        <div className="flex items-stretch justify-center gap-5 px-5 sm:px-6 md:px-8 min-w-max pb-5 pt-5 h-full overflow-x-auto snap-x scroll-smooth">
          {forecastPoints.map((point, index) => {
            const weather = weatherData[index];
            const isSelected = index === selectedMarker;

            return (
              <div
                key={`timeline-${index}`}
                className={cn(
                  "timeline-item flex flex-col items-center p-2",
                  "cursor-pointer h-auto min-h-[320px] sm:min-h-[340px] md:min-h-[360px] lg:min-h-[380px]",
                  "border border-border/30 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]",
                  "flex-shrink-0 snap-center rounded-xl shadow-sm transition-all duration-300",
                  "hover:shadow-md hover:border-primary/20 hover:bg-white/90 dark:hover:bg-card/90",
                  isSelected
                    ? "border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-md"
                    : "border-border/30 bg-white/90 dark:bg-card/90 backdrop-blur-sm"
                )}
                onClick={() => handleItemClick(index)}
              >
                {/* Time */}
                <div className={cn(
                  "flex items-center justify-center w-full",
                  "text-xs font-medium mb-2 py-1 px-2 rounded-full",
                  isSelected ? "bg-primary/10 dark:bg-primary/20 text-primary-foreground" : "bg-muted/30"
                )}>
                  <svg className="h-4 w-4 mr-1 flex-shrink-0 text-current" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.85" />
                    <circle cx="12" cy="12" r="8" fill="white" />
                    <path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                  <span>{formatTime(point.timestamp)}</span>
                </div>

                {/* Weather icon */}
                <div className="my-2 p-2 flex items-center justify-center bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-800/20">
                  {weather ? getWeatherIcon(weather.weatherCode) : (
                    <svg className="h-8 w-8 text-blue-400" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
                      <path d="M9 9h6m-3-3v6m0 3v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>

                {/* Weather data section */}
                <div className="space-y-1.5 w-full mt-2 flex-1 overflow-y-auto px-1 flex flex-col items-center">
                  {/* Temperature */}
                  {weather && (
                    <div className="flex items-center justify-between p-1.5 bg-white/50 dark:bg-card/50 rounded-lg border border-border/10 hover:shadow-sm transition-all duration-300 w-full">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mr-1.5">
                          <svg className="h-4 w-4 text-rose-500" viewBox="0 0 24 24">
                            <path d="M10 2h4v11.5a4 4 0 1 1-4 0V2z" fill="currentColor" />
                            <circle cx="12" cy="17" r="3" fill="currentColor" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-xs">Temperature</div>
                          <div className="text-[10px] text-muted-foreground">Feels like: {formatTemperature(weather.feelsLike)}</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold px-1.5 py-0.5 bg-rose-50 dark:bg-rose-900/20 rounded-md text-rose-700 dark:text-rose-300">
                        {formatTemperature(weather.temperature)}
                      </div>
                    </div>
                  )}

                  {/* Precipitation */}
                  {weather && (
                    <div className="flex items-center justify-between p-1.5 bg-white/50 dark:bg-card/50 rounded-lg border border-border/10 hover:shadow-sm transition-all duration-300 w-full">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-1.5">
                          <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24">
                            <path d="M17.5 14.5c0 3-2.5 5.5-5.5 5.5s-5.5-2.5-5.5-5.5S9 9 12 3c3 6 5.5 8.5 5.5 11.5z" fill="currentColor" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-xs">Precipitation</div>
                          <div className="text-[10px] text-muted-foreground">{(weather.precipitationProbability * 100).toFixed(0)}% chance</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-700 dark:text-blue-300">
                        {weather.precipitation.toFixed(1)}mm
                      </div>
                    </div>
                  )}

                  {/* Wind */}
                  {weather && (
                    <div className="flex items-center justify-between p-1.5 bg-white/50 dark:bg-card/50 rounded-lg border border-border/10 hover:shadow-sm transition-all duration-300 w-full">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mr-1.5">
                          <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24">
                            <path d="M4 12h12c2.2 0 4-1.8 4-4s-1.8-4-4-4" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path d="M4 12l3-3m-3 3l3 3" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path d="M4 20h8c2.2 0 4-1.8 4-4s-1.8-4-4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.7" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-xs">Wind Speed</div>
                          <div className="text-[10px] text-muted-foreground">Direction: {getWindDirection(weather.windDirection)}</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-md text-emerald-700 dark:text-emerald-300">
                        {formatWindSpeed(weather.windSpeed)}
                      </div>
                    </div>
                  )}

                  {/* Humidity */}
                  {weather && (
                    <div className="flex items-center justify-between p-1.5 bg-white/50 dark:bg-card/50 rounded-lg border border-border/10 hover:shadow-sm transition-all duration-300 w-full">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-1.5">
                          <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24">
                            <path d="M12 21.5c-5.5 0-10-4.5-10-10S12 2.5 12 2.5s10 4.5 10 9s-4.5 10-10 10z" fill="currentColor" opacity="0.85" />
                            <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" fill="white" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-xs">Humidity</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-700 dark:text-blue-300">
                        {weather.humidity}%
                      </div>
                    </div>
                  )}

                  {/* Pressure */}
                  {weather && (
                    <div className="flex items-center justify-between p-1.5 bg-white/50 dark:bg-card/50 rounded-lg border border-border/10 hover:shadow-sm transition-all duration-300 w-full">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mr-1.5">
                          <svg className="h-4 w-4 text-purple-500" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.85" />
                            <circle cx="12" cy="12" r="7" fill="white" />
                            <path d="M12 7v5l4 2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-xs">Pressure</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/20 rounded-md text-purple-700 dark:text-purple-300">
                        {weather.pressure} hPa
                      </div>
                    </div>
                  )}

                  {/* UV Index */}
                  {weather && weather.uvIndex !== undefined && (
                    <div className="flex items-center justify-between p-1.5 bg-white/50 dark:bg-card/50 rounded-lg border border-border/10 hover:shadow-sm transition-all duration-300 w-full">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-md bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center mr-1.5">
                          <svg className="h-4 w-4 text-yellow-500" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="5" fill="currentColor" />
                            <path d="M12 2v4M12 18v4M4 12H2M22 12h-4M6 6l2 2M18 6l-2 2M6 18l2-2M18 18l-2-2" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-xs">UV Index</div>
                          <div className="text-[10px] text-muted-foreground">
                            {weather.uvIndex < 3 ? 'Low' :
                             weather.uvIndex < 6 ? 'Moderate' :
                             weather.uvIndex < 8 ? 'High' :
                             weather.uvIndex < 11 ? 'Very High' : 'Extreme'}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold px-1.5 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-yellow-700 dark:text-yellow-300">
                        {weather.uvIndex.toFixed(1)}
                      </div>
                    </div>
                  )}

                  {/* Cloud Cover */}
                  {weather && weather.clouds !== undefined && (
                    <div className="flex items-center justify-between p-1.5 bg-white/50 dark:bg-card/50 rounded-lg border border-border/10 hover:shadow-sm transition-all duration-300 w-full">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-md bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-center mr-1.5">
                          <svg className="h-4 w-4 text-zinc-500" viewBox="0 0 24 24">
                            <path d="M6 19a4 4 0 0 1 0-8h1a7 7 0 0 1 13 3 3 3 0 0 1-3 3h-11z" fill="currentColor" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-xs">Cloud Cover</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-md text-zinc-700 dark:text-zinc-300">
                        {weather.clouds}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Distance marker */}
                <div className="mt-auto pt-1 w-full text-center text-[10px] font-medium text-muted-foreground">
                  {point.distance.toFixed(1)} km
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
