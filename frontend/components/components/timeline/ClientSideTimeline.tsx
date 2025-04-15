'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { ForecastPoint, WeatherData } from '@shared/types';
import { LoadingSpinner } from '@frontend/components/ui/LoadingSpinner';
import { ErrorMessage } from '@frontend/components/ui/ErrorMessage';
import { Card, CardContent } from '@frontend/components/ui/card';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { Button } from '@frontend/components/ui/button';
import { typography, animation, effects, layout, loading } from '@shared/styles/tailwind-utils';

// Dynamically import the Timeline component with no SSR
const SafeTimelineWrapper = dynamic(() => import('./SafeTimelineWrapper'), {
  ssr: false,
  loading: () => (
    <div className={cn("h-[150px]", layout.flexCenter, effects.border, effects.rounded, "bg-muted/30", animation.fadeIn)}>
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
  height = 'h-[150px]',
  showPlaceholder = true,
  showNavigation = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const timelineRef = React.useRef<HTMLDivElement>(null);

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
      className={cn(height, 'relative overflow-hidden', effects.rounded, effects.border, animation.fadeIn, className)}
    >
      {/* Navigation arrows */}
      {showNavigation && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={cn("absolute left-0 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 shadow-sm", effects.buttonHover)}
            onClick={() => handleScroll('left')}
            disabled={scrollPosition <= 10}
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

      <div className={cn("h-full overflow-hidden")} onScroll={handleScrollEvent}>
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
