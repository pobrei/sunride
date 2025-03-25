'use client';

import { useRef, useEffect } from 'react';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { formatTime, formatDistance, formatTemperature, formatWind, getWeatherIconUrl, checkWeatherAlerts } from '@/utils/helpers';
import gsap from 'gsap';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle } from 'lucide-react';

interface TimelineProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onTimelineClick: (index: number) => void;
}

export default function Timeline({ forecastPoints, weatherData, selectedMarker, onTimelineClick }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineItems = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to selected marker
  useEffect(() => {
    if (selectedMarker !== null && timelineItems.current[selectedMarker]) {
      const item = timelineItems.current[selectedMarker];
      item?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedMarker]);

  // Animate timeline items on mount
  useEffect(() => {
    if (timelineRef.current && forecastPoints.length > 0) {
      gsap.fromTo(
        '.timeline-item',
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.05, 
          duration: 0.3, 
          ease: 'power1.out',
          overwrite: true
        }
      );
    }
  }, [forecastPoints]);

  if (forecastPoints.length === 0 || weatherData.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <ScrollArea className="w-full">
          <div className="flex space-x-2 py-2" ref={timelineRef}>
            {forecastPoints.map((point, index) => {
              const weather = weatherData[index];
              if (!weather) return null;
              
              const alerts = checkWeatherAlerts(weather);
              const hasAlert = alerts.extremeHeat || alerts.freezing || alerts.highWind || alerts.heavyRain;
              
              return (
                <div
                  key={index}
                  ref={el => { timelineItems.current[index] = el; }}
                  className={`timeline-item flex-shrink-0 w-36 p-3 rounded-lg cursor-pointer hover:bg-accent transition-smooth micro-shadow ${
                    selectedMarker === index
                      ? 'bg-accent ring-2 ring-primary shadow-md'
                      : 'bg-card hover:scale-105'
                  }`}
                  onClick={() => onTimelineClick(index)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-sm">{formatTime(point.timestamp)}</div>
                    <div className="text-xs text-muted-foreground">{formatDistance(point.distance)}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <img 
                      src={getWeatherIconUrl(weather.weatherIcon)} 
                      alt={weather.weatherDescription}
                      className="w-10 h-10" 
                    />
                    <div>
                      <div className="font-semibold text-lg">{formatTemperature(weather.temperature)}</div>
                      <div className="text-xs text-neutral-400">{formatWind(weather.windSpeed, weather.windDirection)}</div>
                    </div>
                    
                    {hasAlert && (
                      <div className="ml-auto">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs mt-1 truncate">{weather.weatherDescription}</div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 