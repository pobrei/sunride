'use client';

import React from 'react';
import { PageWrapper } from '@frontend/components/layout/page-wrapper';
import { useWeather } from '@frontend/features/weather/context';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { Button } from '@frontend/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Cloud, CloudRain, Droplets, Sun, Wind } from 'lucide-react';
import { WeatherAlerts } from '@frontend/components/weather/WeatherAlerts';
import { ClientSideTimeline } from '@frontend/components/timeline/ClientSideTimeline';
import { cn } from '@shared/lib/utils';
import { typography, animation, effects, layout } from '@shared/styles/tailwind-utils';

export default function WeatherPage() {
  const { gpxData, forecastPoints, weatherData, selectedMarker, setSelectedMarker } = useWeather();

  const handleTimelineClick = (index: number) => {
    setSelectedMarker(index);
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
          <Card className={cn("mb-6", effects.cardHoverable, animation.fadeIn)}>
            <CardHeader className={cn("pb-2")}>
              <CardTitle className={typography.cardTitle}>Weather Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientSideTimeline
                forecastPoints={forecastPoints}
                weatherData={weatherData}
                selectedMarker={selectedMarker}
                onTimelineClick={handleTimelineClick}
                height="h-[200px]"
                showNavigation={true}
              />
            </CardContent>
          </Card>

          <Card className={cn("mb-6", effects.cardHoverable, animation.fadeIn)}>
            <CardHeader className={cn("pb-2")}>
              <CardTitle className={typography.cardTitle}>Weather Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <WeatherAlerts
                forecastPoints={forecastPoints}
                weatherData={weatherData}
                maxInitialAlerts={10}
                compact={false}
              />
            </CardContent>
          </Card>

          {selectedMarker !== null && weatherData[selectedMarker] && (
            <Card className={cn(effects.cardHoverable, animation.fadeIn)}>
              <CardHeader className={cn("pb-2")}>
                <CardTitle className={typography.cardTitle}>Detailed Weather at Selected Point</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn(layout.gridMd, "lg:grid-cols-3 gap-6")}>
                  <div className={cn(effects.cardInner, animation.fadeIn)}>
                    <div className={cn(layout.flexRow, "gap-2 mb-2")}>
                      <Cloud className="h-5 w-5 text-blue-500" />
                      <h3 className={typography.strong}>Temperature</h3>
                    </div>
                    <div className={cn(typography.h3, "mb-1")}>
                      {weatherData[selectedMarker]?.temperature?.toFixed(1) || 'N/A'}°C
                    </div>
                    <div className={cn(typography.bodySm, typography.muted)}>
                      Feels like: {weatherData[selectedMarker]?.feelsLike?.toFixed(1) || 'N/A'}°C
                    </div>
                  </div>

                  <div className={cn(effects.cardInner, animation.fadeIn)}>
                    <div className={cn(layout.flexRow, "gap-2 mb-2")}>
                      <Wind className="h-5 w-5 text-green-500" />
                      <h3 className={typography.strong}>Wind</h3>
                    </div>
                    <div className={cn(typography.h3, "mb-1")}>
                      {weatherData[selectedMarker]?.windSpeed?.toFixed(1) || 'N/A'} km/h
                    </div>
                    <div className={cn(typography.bodySm, typography.muted)}>
                      Gusts: {weatherData[selectedMarker]?.windGust?.toFixed(1) || 'N/A'} km/h
                    </div>
                  </div>

                  <div className={cn(effects.cardInner, animation.fadeIn)}>
                    <div className={cn(layout.flexRow, "gap-2 mb-2")}>
                      <CloudRain className="h-5 w-5 text-blue-500" />
                      <h3 className={typography.strong}>Precipitation</h3>
                    </div>
                    <div className={cn(typography.h3, "mb-1")}>
                      {weatherData[selectedMarker]?.precipitation?.toFixed(1) || 'N/A'} mm
                    </div>
                    <div className={cn(typography.bodySm, typography.muted)}>
                      Probability:{' '}
                      {((weatherData[selectedMarker]?.precipitationProbability || 0) * 100).toFixed(
                        0
                      )}
                      %
                    </div>
                  </div>

                  <div className={cn(effects.cardInner, animation.fadeIn)}>
                    <div className={cn(layout.flexRow, "gap-2 mb-2")}>
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <h3 className={typography.strong}>Humidity</h3>
                    </div>
                    <div className={cn(typography.h3, "mb-1")}>
                      {weatherData[selectedMarker]?.humidity || 'N/A'}%
                    </div>
                    <div className={cn(typography.bodySm, typography.muted)}>
                      Pressure: {weatherData[selectedMarker]?.pressure || 'N/A'} hPa
                    </div>
                  </div>

                  <div className={cn(effects.cardInner, animation.fadeIn)}>
                    <div className={cn(layout.flexRow, "gap-2 mb-2")}>
                      <Sun className="h-5 w-5 text-yellow-500" />
                      <h3 className={typography.strong}>UV Index</h3>
                    </div>
                    <div className={cn(typography.h3, "mb-1")}>
                      {weatherData[selectedMarker]?.uvIndex ?? 'N/A'}
                    </div>
                    <div className={cn(typography.bodySm, typography.muted)}>
                      {getUVIndexDescription(weatherData[selectedMarker]?.uvIndex ?? 0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

function getUVIndexDescription(uvIndex: number): string {
  if (uvIndex <= 2) return 'Low - No protection needed';
  if (uvIndex <= 5) return 'Moderate - Protection recommended';
  if (uvIndex <= 7) return 'High - Protection required';
  if (uvIndex <= 10) return 'Very High - Extra protection needed';
  return 'Extreme - Avoid being outside';
}
