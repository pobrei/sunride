'use client';

import React from 'react';
import { ForecastPoint, WeatherData } from '@/types';
import { formatTime, formatTemperature } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { Cloud, CloudRain, Sun, Wind } from 'lucide-react';

interface ModernTimelineWrapperProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onTimelineClick: (index: number) => void;
  timelineRef?: React.RefObject<HTMLDivElement>;
}

const getWeatherIcon = (weatherCode: number) => {
  if (weatherCode >= 200 && weatherCode < 300) return CloudRain;
  if (weatherCode >= 300 && weatherCode < 600) return CloudRain;
  if (weatherCode >= 600 && weatherCode < 700) return Cloud;
  if (weatherCode >= 700 && weatherCode < 800) return Cloud;
  if (weatherCode === 800) return Sun;
  return Cloud;
};

/**
 * Modern timeline wrapper component
 */
const ModernTimelineWrapper: React.FC<ModernTimelineWrapperProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onTimelineClick,
  timelineRef,
}) => {
  return (
    <div
      ref={timelineRef}
      className="flex gap-3 overflow-x-auto h-full p-4 scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {forecastPoints.map((point, index) => {
        const weather = weatherData[index];
        const isSelected = index === selectedMarker;
        const WeatherIcon = weather ? getWeatherIcon(weather.weatherCode) : Cloud;

        return (
          <div
            key={index}
            className={cn(
              'flex-shrink-0 w-32 p-3 rounded-xl border cursor-pointer transition-all duration-200',
              'hover:shadow-md hover:scale-105',
              isSelected
                ? 'bg-primary/10 border-primary shadow-md scale-105'
                : 'bg-white/50 dark:bg-card/50 border-border/30 hover:bg-white/70 dark:hover:bg-card/70'
            )}
            onClick={() => onTimelineClick(index)}
          >
            <div className="text-center space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                {formatTime(point.timestamp)}
              </div>

              <div className="flex justify-center">
                <WeatherIcon
                  className={cn('h-6 w-6', isSelected ? 'text-primary' : 'text-foreground')}
                />
              </div>

              {weather && (
                <>
                  <div
                    className={cn(
                      'text-sm font-semibold',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {formatTemperature(weather.temperature)}
                  </div>

                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Wind className="h-3 w-3" />
                    <span>{Math.round(weather.windSpeed)} km/h</span>
                  </div>

                  {weather.precipitation > 0 && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {weather.precipitation.toFixed(1)}mm
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ModernTimelineWrapper;
