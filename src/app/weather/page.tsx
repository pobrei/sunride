'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useWeather } from '@/features/weather/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Cloud, CloudRain, Droplets, Sun, Wind } from 'lucide-react';
import { WeatherAlerts } from '@/components/weather/WeatherAlerts';
import { ClientSideTimeline } from '@/components/timeline/ClientSideTimeline';

export default function WeatherPage() {
  const {
    gpxData,
    forecastPoints,
    weatherData,
    selectedMarker,
    setSelectedMarker,
  } = useWeather();

  const handleTimelineClick = (index: number) => {
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
        <h1 className="text-2xl font-bold">Weather Forecast</h1>
      </div>

      {forecastPoints.length > 0 && weatherData.length > 0 ? (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Weather Timeline</CardTitle>
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

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle>Weather Alerts</CardTitle>
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Detailed Weather at Selected Point</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Temperature</h3>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {weatherData[selectedMarker]?.temperature?.toFixed(1) || 'N/A'}°C
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Feels like: {weatherData[selectedMarker]?.feelsLike?.toFixed(1) || 'N/A'}°C
                    </div>
                  </div>

                  <div className="bg-muted/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">Wind</h3>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {weatherData[selectedMarker]?.windSpeed?.toFixed(1) || 'N/A'} km/h
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Gusts: {weatherData[selectedMarker]?.windGust?.toFixed(1) || 'N/A'} km/h
                    </div>
                  </div>

                  <div className="bg-muted/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CloudRain className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Precipitation</h3>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {weatherData[selectedMarker]?.precipitation?.toFixed(1) || 'N/A'} mm
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Probability: {((weatherData[selectedMarker]?.precipitationProbability || 0) * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="bg-muted/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Humidity</h3>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {weatherData[selectedMarker]?.humidity || 'N/A'}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Pressure: {weatherData[selectedMarker]?.pressure || 'N/A'} hPa
                    </div>
                  </div>

                  <div className="bg-muted/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-medium">UV Index</h3>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {weatherData[selectedMarker]?.uvIndex ?? 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getUVIndexDescription(weatherData[selectedMarker]?.uvIndex ?? 0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Cloud className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-medium mb-2">No Weather Data Available</h2>
            <p className="text-muted-foreground mb-4">
              Please upload a GPX file on the home page to view weather forecasts along your route.
            </p>
            <Button asChild>
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
