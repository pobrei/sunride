'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

// Import from features
import { ForecastPoint, WeatherData } from '@/features/weather/types';

// Import from components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { typography, animation, effects, layout } from '@/styles/tailwind-utils';
import { useIsMobile } from '@/hooks/useMediaQuery';

// Import from utils
import {
  formatTime,
  formatDistance,
  formatTemperature,
  formatWind,
  getWeatherIconUrl,
  checkWeatherAlerts,
} from '@/utils/formatUtils';

interface StickyTimelineProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onTimelineClick: (index: number) => void;
  className?: string;
  height?: string;
  showPlaceholder?: boolean;
  showNavigation?: boolean;
}

export function StickyTimeline({
  forecastPoints,
  weatherData,
  selectedMarker,
  onTimelineClick,
  className = '',
  height = 'h-[150px]',
  showPlaceholder = true,
  showNavigation = true,
}: StickyTimelineProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isSticky, setIsSticky] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Scroll to selected marker when it changes
  useEffect(() => {
    if (
      selectedMarker !== null &&
      timelineItemsRef.current[selectedMarker] &&
      timelineRef.current
    ) {
      const item = timelineItemsRef.current[selectedMarker];
      const container = timelineRef.current;

      if (item) {
        // Calculate the scroll position to center the item
        const itemRect = item.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const scrollPosition =
          item.offsetLeft - containerRect.width / 2 + itemRect.width / 2;

        // Use GSAP for smooth scrolling
        gsap.to(container, {
          scrollLeft: scrollPosition,
          duration: 0.5,
          ease: 'power2.out',
        });
      }
    }
  }, [selectedMarker]);

  // Handle sticky behavior on scroll
  useEffect(() => {
    if (!isMobile) return; // Only apply sticky behavior on mobile

    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const shouldBeSticky = rect.top <= 0;
      
      if (shouldBeSticky !== isSticky) {
        setIsSticky(shouldBeSticky);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSticky, isMobile]);

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
    
    e.preventDefault();
    const x = e.pageX - timelineRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    timelineRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!timelineRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - timelineRef.current.offsetLeft);
    setScrollLeft(timelineRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !timelineRef.current) return;
    
    const x = e.touches[0].pageX - timelineRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    timelineRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Navigation buttons
  const handleScroll = (direction: 'left' | 'right') => {
    if (!timelineRef.current) return;
    
    const container = timelineRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    
    gsap.to(container, {
      scrollLeft: container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount),
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  // If no data, show placeholder
  if ((!forecastPoints || forecastPoints.length === 0 || !weatherData || weatherData.length === 0) && showPlaceholder) {
    return (
      <Card className={cn(height, "w-full", className)}>
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>No timeline data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full",
        isSticky && isMobile ? "sticky top-0 z-50" : "",
        className
      )}
    >
      <Card 
        className={cn(
          height,
          "w-full",
          isSticky && isMobile ? "rounded-none border-x-0 shadow-md" : "",
          animation.fadeIn
        )}
      >
        <CardContent className="p-0 h-full relative">
          {showNavigation && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={cn("absolute left-0 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 shadow-sm", effects.buttonHover)}
                onClick={() => handleScroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("absolute right-0 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 shadow-sm", effects.buttonHover)}
                onClick={() => handleScroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          <div className="w-full overflow-hidden">
            <div
              className={cn(
                "timeline-scrollable-area flex space-x-2 py-2 px-4 overflow-x-auto scrollbar-thin whitespace-nowrap",
                isDragging ? "cursor-grabbing" : "cursor-grab"
              )}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              ref={timelineRef}
            >
              {forecastPoints &&
                forecastPoints.map((point, index) => {
                  if (!point || typeof point.lat !== 'number' || typeof point.lon !== 'number')
                    return null;
                  const weather = weatherData && weatherData[index];
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
                      className={cn(
                        'timeline-item flex-shrink-0 w-36 p-3 rounded-lg cursor-pointer transition-all duration-200',
                        selectedMarker === index
                          ? 'bg-accent ring-2 ring-primary shadow-md scale-105 z-10'
                          : 'bg-card hover:bg-accent/50 hover:scale-102',
                        hasAlert && 'ring-1 ring-yellow-500/50'
                      )}
                      onClick={() => onTimelineClick(index)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm">{formatTime(point.timestamp)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistance(point.distance)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <img
                          src={getWeatherIconUrl(weather.weatherIcon)}
                          alt={weather.weatherDescription}
                          className="w-10 h-10"
                        />
                        <div>
                          <div className={cn(typography.bodyLg, typography.strong)}>
                            {formatTemperature(weather.temperature)}
                          </div>
                          <div className={cn(typography.bodySm, typography.muted)}>
                            {formatWind(weather.windSpeed, weather.windDirection)}
                          </div>
                        </div>

                        {hasAlert && (
                          <div className="ml-auto">
                            <AlertTriangle className={cn("h-5 w-5 text-amber-500", animation.pulse)} />
                          </div>
                        )}
                      </div>

                      <div className={cn(typography.bodySm, "mt-1 truncate")}>{weather.weatherDescription}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StickyTimeline;
