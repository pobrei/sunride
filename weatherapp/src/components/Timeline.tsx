'use client';

import { useRef, useEffect, useState } from 'react';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { formatTime, formatDistance, formatTemperature, formatWind, getWeatherIconUrl, checkWeatherAlerts } from '../utils/helpers';
import gsap from 'gsap';
import { Card, CardContent } from '@/components/ui/card';
// Removed ScrollArea import
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelineProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
  selectedMarker: number | null;
  onTimelineClick: (index: number) => void;
}

export default function Timeline({ forecastPoints, weatherData, selectedMarker, onTimelineClick }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineItems = useRef<(HTMLDivElement | null)[]>([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Navigate to the next or previous point
  const navigatePoint = (direction: 'next' | 'prev') => {
    if (selectedMarker === null && forecastPoints.length > 0) {
      // If no marker is selected, select the first or last one
      onTimelineClick(direction === 'next' ? 0 : forecastPoints.length - 1);
      return;
    }

    if (selectedMarker !== null) {
      const newIndex = direction === 'next'
        ? Math.min(selectedMarker + 1, forecastPoints.length - 1)
        : Math.max(selectedMarker - 1, 0);

      if (newIndex !== selectedMarker) {
        onTimelineClick(newIndex);
      }
    }
  };

  // Scroll to selected marker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (selectedMarker !== null && timelineItems.current[selectedMarker]) {
      // Wait a bit to ensure DOM is ready
      setTimeout(() => {
        const item = timelineItems.current[selectedMarker];
        const scrollableArea = timelineRef.current;

        if (item && scrollableArea) {
          // Calculate the scroll position to center the item
          const containerRect = scrollableArea.getBoundingClientRect();
          const itemRect = item.getBoundingClientRect();

          // Calculate the scroll position to center the item
          const scrollLeft = scrollableArea.scrollLeft;
          const targetScrollLeft = scrollLeft + (itemRect.left - containerRect.left) - (containerRect.width / 2) + (itemRect.width / 2);

          // Scroll to the target position
          scrollableArea.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  }, [selectedMarker]);

  // Animate timeline items on mount
  useEffect(() => {
    if (timelineRef.current && forecastPoints.length > 0) {
      // Wait for DOM to be updated
      setTimeout(() => {
        const timelineItems = document.querySelectorAll('.timeline-item');
        if (timelineItems.length > 0) {
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
      }, 0);
    }
  }, [forecastPoints]);

  // Handle manual scrolling with the navigation buttons
  const handleScroll = (direction: 'left' | 'right') => {
    const scrollAmount = 200; // pixels to scroll
    const scrollableArea = timelineRef.current;

    if (scrollableArea) {
      const newPosition = direction === 'left'
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(maxScroll, scrollPosition + scrollAmount);

      scrollableArea.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });

      setScrollPosition(newPosition);
      updateArrowVisibility(newPosition);
    }
  };

  // Mouse event handlers for drag scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - timelineRef.current.offsetLeft);
    setScrollLeft(timelineRef.current.scrollLeft);
    timelineRef.current.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (timelineRef.current) {
      timelineRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;

    e.preventDefault();
    const x = e.pageX - timelineRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    const newScrollLeft = scrollLeft - walk;

    timelineRef.current.scrollLeft = newScrollLeft;
    setScrollPosition(newScrollLeft);
    updateArrowVisibility(newScrollLeft);
  };

  // Add global mouse up handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (timelineRef.current) {
          timelineRef.current.style.cursor = 'grab';
        }
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Update arrow visibility based on scroll position
  const updateArrowVisibility = (position: number) => {
    setShowLeftArrow(position > 20);
    setShowRightArrow(position < maxScroll - 20);
  };

  // Calculate max scroll and set up scroll event listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Wait for DOM to be ready
    setTimeout(() => {
      const scrollableArea = timelineRef.current;
      if (!scrollableArea) return;

      const calculateMaxScroll = () => {
        const { scrollWidth, clientWidth } = scrollableArea;
        return scrollWidth - clientWidth;
      };

      const handleScrollEvent = () => {
        const newPosition = scrollableArea.scrollLeft;
        setScrollPosition(newPosition);
        updateArrowVisibility(newPosition);
      };

      // Initial calculations
      const maxScrollValue = calculateMaxScroll();
      setMaxScroll(maxScrollValue);
      updateArrowVisibility(scrollableArea.scrollLeft);

      // Add scroll event listener
      scrollableArea.addEventListener('scroll', handleScrollEvent);

      // Add resize observer to recalculate on resize
      let resizeObserver: ResizeObserver | null = null;

      // Only create ResizeObserver in browser environment
      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => {
          const newMaxScroll = calculateMaxScroll();
          setMaxScroll(newMaxScroll);
          updateArrowVisibility(scrollableArea.scrollLeft);
        });

        resizeObserver.observe(scrollableArea);
      }

      return () => {
        scrollableArea.removeEventListener('scroll', handleScrollEvent);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
    }, 100); // Small delay to ensure DOM is ready
  }, [forecastPoints]); // Re-run when forecast points change

  if (!forecastPoints || forecastPoints.length === 0 || !weatherData || weatherData.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4 relative">
      <CardContent className="p-4">
        {/* Left navigation arrow - for scrolling */}
        {showLeftArrow && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-background/80 backdrop-blur-sm"
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Right navigation arrow - for scrolling */}
        {showRightArrow && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-background/80 backdrop-blur-sm"
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        <div className="w-full overflow-hidden">
          <div
            className="timeline-scrollable-area flex space-x-2 py-2 px-4 overflow-x-auto"
            style={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent',
              whiteSpace: 'nowrap',
              msOverflowStyle: 'none',  /* IE and Edge */
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            ref={timelineRef}
          >
            {forecastPoints && forecastPoints.map((point, index) => {
              if (!point || typeof point.lat !== 'number' || typeof point.lon !== 'number') return null;
              const weather = weatherData && weatherData[index];
              if (!weather) return null;

              const alerts = checkWeatherAlerts(weather);
              const hasAlert = alerts.extremeHeat || alerts.freezing || alerts.highWind || alerts.heavyRain;

              return (
                <div
                  key={index}
                  ref={el => { timelineItems.current[index] = el; }}
                  className={`timeline-item flex-shrink-0 w-36 p-3 rounded-lg cursor-pointer hover:bg-accent transition-smooth micro-shadow ${
                    selectedMarker === index
                      ? 'bg-accent ring-2 ring-primary shadow-md scale-110 z-10'
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
                      <div className="text-xs text-muted-foreground">{formatWind(weather.windSpeed, weather.windDirection)}</div>
                    </div>

                    {hasAlert && (
                      <div className="ml-auto">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      </div>
                    )}
                  </div>

                  <div className="text-xs mt-1 truncate">{weather.weatherDescription}</div>
                </div>
              );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}