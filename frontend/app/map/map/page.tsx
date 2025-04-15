'use client';

import React from 'react';
import { PageWrapper } from '@frontend/components/layout/page-wrapper';
import { ClientSideMap } from '@frontend/components/map/ClientSideMap';
import { useWeather } from '@frontend/features/weather/context';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { Button } from '@frontend/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MapPin, Wind, Droplets, Thermometer, Gauge, Sun } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { typography, animation, effects, layout } from '@shared/styles/tailwind-utils';

export default function MapPage() {
  const { gpxData, forecastPoints, weatherData, selectedMarker, setSelectedMarker } = useWeather();

  const handleMarkerClick = (index: number) => {
    setSelectedMarker(index);
  };

  return (
    <PageWrapper>
      <div className={cn("flex items-center gap-2 mb-6", animation.fadeIn)}>
        <Button variant="outline" size="sm" asChild className={effects.buttonHover}>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <h1 className={cn(typography.h2)}>Interactive Map</h1>
      </div>

      <Card className={cn("mb-6", animation.fadeIn, effects.cardHoverable)}>
        <CardHeader className="pb-2">
          <CardTitle className={cn(typography.cardTitle)}>Route Map with Weather Data</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientSideMap
            gpxData={gpxData}
            forecastPoints={forecastPoints}
            weatherData={weatherData}
            onMarkerClick={handleMarkerClick}
            selectedMarker={selectedMarker}
            height="h-[600px]"
            className="map-container"
            showPlaceholder={true}
          />
        </CardContent>
      </Card>

      {selectedMarker !== null && weatherData[selectedMarker] && (
        <Card className={cn(animation.fadeIn, effects.cardHoverable)}>
          <CardHeader className="pb-2">
            <CardTitle className={cn(typography.cardTitle)}>Selected Point Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(layout.grid, "md:grid-cols-2 lg:grid-cols-3 gap-4")}>
              <div className={cn(effects.cardInner)}>
                <h3 className={cn(typography.h6, "flex items-center gap-1 mb-1")}>
                  <MapPin className="h-4 w-4" />
                  Location
                </h3>
                <p className={cn(typography.bodySm)}>
                  Lat: {forecastPoints[selectedMarker].lat.toFixed(4)}, Lon:{' '}
                  {forecastPoints[selectedMarker].lon.toFixed(4)}
                </p>
              </div>
              <div className={cn(effects.cardInner)}>
                <h3 className={cn(typography.h6, "flex items-center gap-1 mb-1")}>
                  <Thermometer className="h-4 w-4" />
                  Temperature
                </h3>
                <p className={cn(typography.bodySm)}>
                  {weatherData[selectedMarker]?.temperature?.toFixed(1) || 'N/A'}°C (Feels like:{' '}
                  {weatherData[selectedMarker]?.feelsLike?.toFixed(1) || 'N/A'}°C)
                </p>
              </div>
              <div className={cn(effects.cardInner)}>
                <h3 className={cn(typography.h6, "flex items-center gap-1 mb-1")}>
                  <Wind className="h-4 w-4" />
                  Wind
                </h3>
                <p className={cn(typography.bodySm)}>
                  {weatherData[selectedMarker]?.windSpeed?.toFixed(1) || 'N/A'} km/h (Gusts:{' '}
                  {weatherData[selectedMarker]?.windGust?.toFixed(1) || 'N/A'} km/h)
                </p>
              </div>
              <div className={cn(effects.cardInner)}>
                <h3 className={cn(typography.h6, "flex items-center gap-1 mb-1")}>
                  <Droplets className="h-4 w-4" />
                  Precipitation
                </h3>
                <p className={cn(typography.bodySm)}>
                  {weatherData[selectedMarker]?.precipitation?.toFixed(1) || 'N/A'} mm (Probability:{' '}
                  {((weatherData[selectedMarker]?.precipitationProbability || 0) * 100).toFixed(0)}
                  %)
                </p>
              </div>
              <div className={cn(effects.cardInner)}>
                <h3 className={cn(typography.h6, "flex items-center gap-1 mb-1")}>
                  <Gauge className="h-4 w-4" />
                  Humidity & Pressure
                </h3>
                <p className={cn(typography.bodySm)}>
                  {weatherData[selectedMarker]?.humidity || 'N/A'}% /{' '}
                  {weatherData[selectedMarker]?.pressure || 'N/A'} hPa
                </p>
              </div>
              <div className={cn(effects.cardInner)}>
                <h3 className={cn(typography.h6, "flex items-center gap-1 mb-1")}>
                  <Sun className="h-4 w-4" />
                  UV Index
                </h3>
                <p className={cn(typography.bodySm)}>{weatherData[selectedMarker]?.uvIndex ?? 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}
