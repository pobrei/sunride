'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { typography, animation, effects, layout, responsive } from '@/styles/tailwind-utils';

// Dynamically import the Timeline component with no SSR
const SafeTimelineWrapper = dynamic(() => import('./SafeTimelineWrapper'), {
  ssr: false,
  loading: () => (
    <div className={cn("h-[400px] sm:h-[450px] md:h-[480px] lg:h-[500px]", layout.flexCenter, "border border-border bg-muted/30")}>
      <LoadingSpinner
        message="Loading timeline..."
        centered
        variant="train"
        withContainer
        size="md"
      />
    </div>
  ),
});

interface ClientSideTimelineProps {
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

export const ClientSideTimeline: React.FC<ClientSideTimelineProps> = ({
  forecastPoints,
  weatherData,
  selectedMarker,
  onTimelineClick,
  className,
  height = 'h-[400px] sm:h-[450px] md:h-[480px] lg:h-[500px]',
  showPlaceholder = true,
  showNavigation = true,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const timelineRef = React.useRef<HTMLDivElement | null>(null);

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

  // Scroll to selected marker
  useEffect(() => {
    if (selectedMarker !== null && timelineRef.current) {
      const timelineItems = timelineRef.current.querySelectorAll('.timeline-item');
      if (timelineItems[selectedMarker]) {
        timelineItems[selectedMarker].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [selectedMarker]);

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
      <Card className={cn(height, 'overflow-hidden', animation.fadeIn, className)}>
        <CardContent className={cn("p-0 h-full")}>
          <div className={cn(layout.flexCenter, "h-full bg-muted/20")}>
            <div className={cn(typography.center, "p-6", animation.fadeInSlideUp)}>
              <div className={cn(layout.flexCenter, "mx-auto w-10 h-10 rounded-full bg-muted/40 mb-3", animation.fadeIn)}>
                <Clock className={cn("h-5 w-5", typography.muted)} />
              </div>
              <h3 className={cn(typography.h5, "mb-1")}>No Timeline Data</h3>
              <p className={cn(typography.bodySm, typography.muted, "max-w-xs")}>
                Upload a GPX file to see your route timeline with weather data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If there's an error, show an error message
  if (hasError) {
    return (
      <div className={cn(height, effects.rounded, 'overflow-hidden', animation.fadeIn, className)}>
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
      className={cn(height, 'relative overflow-hidden border border-border/30 rounded-2xl shadow-sm', className)}
    >
      {/* Navigation arrows */}
      {showNavigation && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-[5] h-10 w-10 bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white dark:hover:bg-card transition-all duration-300"
            onClick={() => handleScroll('left')}
            disabled={scrollPosition <= 10}
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-[5] h-10 w-10 bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white dark:hover:bg-card transition-all duration-300"
            onClick={() => handleScroll('right')}
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </Button>
        </>
      )}

      <div className={cn("h-full", responsive.scrollContainer)} onScroll={handleScrollEvent}>
        <SafeTimelineWrapper
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
