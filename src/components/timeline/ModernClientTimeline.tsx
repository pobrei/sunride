'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect, useRef } from 'react';
import { ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Dynamically import the ModernTimeline component with no SSR
const ModernTimelineWrapper = dynamic(() => import('./ModernTimelineWrapper'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center border border-border/20 rounded-2xl bg-white/50 dark:bg-card/50 backdrop-blur-sm">
      <LoadingSpinner
        message="Loading timeline..."
        centered
        variant="dots"
        withContainer
        size="md"
      />
    </div>
  ),
});

interface ModernClientTimelineProps {
  /** Forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Currently selected marker index */
  selectedMarker: number | null;
  /** Callback when a timeline item is clicked */
  onTimelineClick: (index: number) => void;
  /** Optional className for styling */
  className?: string;
  /** Optional height for the timeline */
  height?: string;
  /** Whether to show a placeholder when no data is available */
  showPlaceholder?: boolean;
  /** Whether to show navigation arrows */
  showNavigation?: boolean;
}

export const ModernClientTimeline: React.FC<ModernClientTimelineProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onTimelineClick,
  className,
  height = 'h-[420px] sm:h-[440px] md:h-[460px] lg:h-[480px]',
  showPlaceholder = true,
  showNavigation = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // Simulate timeline initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Handle errors
  useEffect(() => {
    try {
      // Validate data
      if (forecastPoints && weatherData && forecastPoints.length !== weatherData.length) {
        throw new Error('Forecast points and weather data length mismatch');
      }
    } catch (error) {
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [forecastPoints, weatherData]);

  // Handle scroll navigation
  const handleScroll = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      timelineRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Track scroll position for showing/hiding navigation buttons
  const handleScrollEvent = () => {
    if (timelineRef.current) {
      setScrollPosition(timelineRef.current.scrollLeft);
    }
  };

  // If there's no data, show a placeholder
  if (
    (!forecastPoints || forecastPoints.length === 0 || !weatherData || weatherData.length === 0) &&
    showPlaceholder
  ) {
    return (
      <Card className={cn(height, 'overflow-hidden', 'animate-fade-in', className)}>
        <div className="h-full w-full flex items-center justify-center bg-white/50 dark:bg-card/50 backdrop-blur-sm">
          <div className="text-center p-6 animate-fade-in-up">
            <div className="mx-auto w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center mb-3 animate-fade-in">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No Timeline Data</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Upload a GPX file to see your route timeline with weather data
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // If there's an error, show an error message
  if (hasError) {
    return (
      <div className={cn(height, 'rounded-2xl overflow-hidden animate-fade-in', className)}>
        <ErrorMessage
          title="Timeline Error"
          message={errorMessage || 'Failed to load the timeline component'}
          severity="warning"
          withContainer
          className="h-full"
          size="sm"
        />
      </div>
    );
  }

  // If everything is fine, render the timeline
  return (
    <div
      className={cn(
        height,
        'relative overflow-hidden rounded-xl shadow-sm animate-fade-in',
        'bg-white/30 dark:bg-card/30 backdrop-blur-sm border border-border/20',
        className
      )}
    >
      {/* Navigation arrows */}
      {showNavigation && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute left-1 top-1/2 transform -translate-y-1/2 z-[5] h-8 w-8 rounded-full",
              "bg-primary/10 dark:bg-primary/20 backdrop-blur-md shadow-sm",
              "hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-300",
              "border border-primary/20",
              scrollPosition <= 10 && "opacity-50 pointer-events-none"
            )}
            onClick={() => handleScroll('left')}
            disabled={scrollPosition <= 10}
          >
            <ChevronLeft className="h-4 w-4 text-primary dark:text-primary/90" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 z-[5] h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 backdrop-blur-md shadow-sm hover:bg-primary/20 dark:hover:bg-primary/30 transition-all duration-300 border border-primary/20"
            onClick={() => handleScroll('right')}
          >
            <ChevronRight className="h-4 w-4 text-primary dark:text-primary/90" />
          </Button>
        </>
      )}

      <div className="h-full p-1" onScroll={handleScrollEvent}>
        <ModernTimelineWrapper
          forecastPoints={forecastPoints}
          weatherData={weatherData}
          selectedMarker={selectedMarker}
          onTimelineClick={onTimelineClick}
          timelineRef={timelineRef}
        />
      </div>
    </div>
  );
};

export default ModernClientTimeline;
