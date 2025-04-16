'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatDistance } from '@/utils/formatters';
import { cn } from '@/styles/tailwind-utils';
import { Cloud, CloudRain, Thermometer, Wind } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/simple-tooltip';

interface TimelineProps {
  /** Forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Currently selected marker index */
  selectedMarker: number | null;
  /** Callback when a timeline item is clicked */
  onTimelineClick: (index: number) => void;
  /** Reference to the timeline container for scrolling */
  timelineRef?: React.RefObject<HTMLDivElement>;
}

/**
 * A horizontal timeline component that displays weather data at different points
 */
export function Timeline({
  forecastPoints,
  weatherData,
  selectedMarker,
  onTimelineClick,
  timelineRef: externalTimelineRef,
}: TimelineProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const internalTimelineRef = useRef<HTMLDivElement>(null);
  const timelineItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Use external ref if provided, otherwise use internal ref
  const timelineRef = externalTimelineRef || internalTimelineRef;

  // Initialize timeline items array
  useEffect(() => {
    timelineItemsRef.current = timelineItemsRef.current.slice(0, forecastPoints.length);
  }, [forecastPoints]);

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - timelineRef.current.offsetLeft);
    setScrollLeft(timelineRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;

    const x = e.pageX - timelineRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    timelineRef.current.scrollLeft = scrollLeft - walk;
  };

  // Check for weather alerts
  const checkWeatherAlerts = (weather: WeatherData) => {
    return {
      extremeHeat: weather.temperature > 35,
      freezing: weather.temperature < 0,
      highWind: weather.windSpeed > 30,
      heavyRain: weather.precipitation > 5,
    };
  };

  return (
    <div className="w-full overflow-hidden">
      <div
        className={cn(
          'timeline-container flex space-x-4 py-4 px-4 overflow-x-auto whitespace-nowrap relative',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        ref={timelineRef}
      >
        {/* Connector line that runs through all events */}
        <div className="absolute h-0.5 bg-muted left-0 right-0 top-6 z-0"></div>

        {forecastPoints.map((point, index) => {
          if (!point || typeof point.lat !== 'number' || typeof point.lon !== 'number') return null;
          const weather = weatherData[index];
          if (!weather) return null;

          const alerts = checkWeatherAlerts(weather);
          const hasAlert =
            alerts.extremeHeat || alerts.freezing || alerts.highWind || alerts.heavyRain;

          return (
            <div
              key={index}
              ref={el => {
                timelineItemsRef.current[index] = el;
              }}
              className="timeline-event flex flex-col items-center"
              onClick={() => onTimelineClick(index)}
            >
              {/* Circle event marker */}
              <div
                className={cn(
                  "timeline-event-circle",
                  selectedMarker === index ? "active" : "",
                  hasAlert ? "ring-1 ring-yellow-500" : ""
                )}
              >
                <Thermometer className="h-3 w-3 text-white" />
              </div>

              {/* Timeline content card */}
              <div
                className={cn(
                  "timeline-content w-36 cursor-pointer",
                  selectedMarker === index
                    ? 'bg-accent ring-2 ring-primary shadow-md z-10'
                    : 'bg-card hover:bg-accent/50',
                  hasAlert && 'ring-1 ring-yellow-500/50'
                )}
              >
                {/* Time and weather inline */}
                <div className="timeline-time-weather">
                  <span>{formatTime(point.timestamp)}</span>
                  <Thermometer className="timeline-weather-icon" />
                  <span>{Math.round(weather.temperature)}°C</span>
                </div>

                <div className="text-xs text-muted mt-1">
                  {formatDistance(point.distance)} · {weather.weatherDescription || 'Weather data'}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">{Math.round(weather.windSpeed)} km/h</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <CloudRain className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">{Math.round(weather.precipitation * 100)}%</span>
                  </div>
                </div>

                {hasAlert && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mt-1 text-xs text-yellow-500 flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                          Weather alert
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          {alerts.extremeHeat && <div>Extreme heat</div>}
                          {alerts.freezing && <div>Freezing conditions</div>}
                          {alerts.highWind && <div>High wind</div>}
                          {alerts.heavyRain && <div>Heavy rain</div>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
