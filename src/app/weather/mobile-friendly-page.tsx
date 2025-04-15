'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useWeather } from '@/features/weather/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Cloud, ChevronUp, ChevronDown, X } from 'lucide-react';
import { WeatherAlerts } from '@/components/weather/WeatherAlerts';
import { StickyTimeline } from '@/features/timeline/components';
import { CollapsibleWeatherPanel } from '@/features/weather/components';
import { cn } from '@/lib/utils';
import { typography, animation, effects, layout } from '@/styles/tailwind-utils';
import { useIsMobile } from '@/hooks/useMediaQuery';

export default function MobileFriendlyWeatherPage() {
  const { gpxData, forecastPoints, weatherData, selectedMarker, setSelectedMarker } = useWeather();
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const handleTimelineClick = (index: number) => {
    setSelectedMarker(index);
  };

  const handleCloseWeatherPanel = () => {
    setSelectedMarker(null);
  };

  return (
    <PageWrapper>
      <div className={cn(layout.flexRow, "gap-2 mb-6", animation.fadeIn)}>
        <Button variant="outline" size="sm" asChild className={effects.buttonHover}>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <h1 className={cn(typography.h2)}>Weather Forecast</h1>
      </div>

      {forecastPoints.length > 0 && weatherData.length > 0 ? (
        <>
          {/* Sticky Timeline for mobile */}
          <div className={cn("mb-6", animation.fadeIn)}>
            <StickyTimeline
              forecastPoints={forecastPoints}
              weatherData={weatherData}
              selectedMarker={selectedMarker}
              onTimelineClick={handleTimelineClick}
              height="h-[200px]"
              showNavigation={true}
            />
          </div>

          {/* Collapsible Weather Alerts Panel */}
          <Card className={cn("mb-6", effects.cardHoverable, animation.fadeIn)}>
            <CardHeader className={cn("pb-2", "flex flex-row items-center justify-between")}>
              <CardTitle className={typography.cardTitle}>Weather Alerts</CardTitle>
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => setAlertsExpanded(!alertsExpanded)}
                >
                  {alertsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </CardHeader>
            {(!isMobile || alertsExpanded) && (
              <CardContent>
                <WeatherAlerts
                  forecastPoints={forecastPoints}
                  weatherData={weatherData}
                  maxInitialAlerts={isMobile ? 3 : 10}
                  compact={isMobile}
                />
              </CardContent>
            )}
          </Card>

          {/* Collapsible Weather Detail Panel */}
          {selectedMarker !== null && weatherData[selectedMarker] && forecastPoints[selectedMarker] && (
            <div className={cn(animation.fadeIn)}>
              <CollapsibleWeatherPanel
                point={forecastPoints[selectedMarker]}
                weather={weatherData[selectedMarker]!}
                onClose={handleCloseWeatherPanel}
                defaultCollapsed={isMobile}
              />
            </div>
          )}
        </>
      ) : (
        <Card className={cn(effects.cardHoverable, animation.fadeIn)}>
          <CardContent className={cn("p-8", typography.center)}>
            <div className={cn(layout.flexCenter, "mx-auto w-12 h-12 rounded-full bg-muted/40 mb-4", animation.fadeIn)}>
              <Cloud className={cn("h-8 w-8", typography.muted)} />
            </div>
            <h2 className={cn(typography.h4, "mb-2")}>No Weather Data Available</h2>
            <p className={cn(typography.bodySm, typography.muted, "mb-4")}>
              Please upload a GPX file on the home page to view weather forecasts along your route.
            </p>
            <Button asChild className={cn(animation.buttonPress)}>
              <Link href="/">Go to Home Page</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}
