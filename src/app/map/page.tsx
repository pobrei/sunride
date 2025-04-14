'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ClientSideMap } from '@/components/map/ClientSideMap';
import { useWeather } from '@/features/weather/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MapPage() {
  const {
    gpxData,
    forecastPoints,
    weatherData,
    selectedMarker,
    setSelectedMarker,
  } = useWeather();

  const handleMarkerClick = (index: number) => {
    setSelectedMarker(index);
  };

  return (
    <PageWrapper>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Interactive Map</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Route Map with Weather Data</CardTitle>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Selected Point Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Location</h3>
                <p className="text-sm">
                  Lat: {forecastPoints[selectedMarker].lat.toFixed(4)},
                  Lon: {forecastPoints[selectedMarker].lon.toFixed(4)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Temperature</h3>
                <p className="text-sm">
                  {weatherData[selectedMarker]?.temperature?.toFixed(1) || 'N/A'}°C
                  (Feels like: {weatherData[selectedMarker]?.feelsLike?.toFixed(1) || 'N/A'}°C)
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Wind</h3>
                <p className="text-sm">
                  {weatherData[selectedMarker]?.windSpeed?.toFixed(1) || 'N/A'} km/h
                  (Gusts: {weatherData[selectedMarker]?.windGust?.toFixed(1) || 'N/A'} km/h)
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Precipitation</h3>
                <p className="text-sm">
                  {weatherData[selectedMarker]?.precipitation?.toFixed(1) || 'N/A'} mm
                  (Probability: {((weatherData[selectedMarker]?.precipitationProbability || 0) * 100).toFixed(0)}%)
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Humidity & Pressure</h3>
                <p className="text-sm">
                  {weatherData[selectedMarker]?.humidity || 'N/A'}% / {weatherData[selectedMarker]?.pressure || 'N/A'} hPa
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">UV Index</h3>
                <p className="text-sm">
                  {weatherData[selectedMarker]?.uvIndex ?? 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}
