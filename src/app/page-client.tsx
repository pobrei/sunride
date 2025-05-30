'use client';

import React, { useState } from 'react';
import { useWeather } from '@/features/weather/context';
import SimpleGPXUploader from '@/features/gpx/components/SimpleGPXUploader';
import { ModernMap } from '@/components/map/ModernMap';
import { ModernTimeline } from '@/components/timeline/ModernTimeline';
import ModernTripSummary from '@/features/route/components/ModernTripSummary';
import ClientSideCharts from '@/components/charts/ClientSideCharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { layout, responsive } from '@/styles/tailwind-utils';

/**
 * Main SunRide application component
 * Contains all the core functionality: GPX upload, map display, weather data, timeline
 */
export default function SunRideApp(): React.ReactElement {
  const {
    gpxData,
    forecastPoints,
    weatherData,
    isLoading,
    isGenerating,
    setGpxData,
    generateWeatherForecast,
  } = useWeather();

  const [selectedTimelineMarker, setSelectedTimelineMarker] = useState<number | null>(null);
  const [weatherInterval, setWeatherInterval] = useState<number>(5);
  const [avgSpeed, setAvgSpeed] = useState<number>(15);

  // Handle GPX file upload
  const handleGPXLoaded = (data: unknown) => {
    console.log('GPX data loaded:', data);
    setGpxData(data);
  };

  // Handle timeline marker click
  const handleTimelineClick = (markerIndex: number) => {
    setSelectedTimelineMarker(markerIndex);
  };

  // Handle map marker click
  const handleMapMarkerClick = (markerIndex: number) => {
    setSelectedTimelineMarker(markerIndex);
  };

  // Handle weather forecast generation
  const handleGenerateForecast = () => {
    if (gpxData) {
      generateWeatherForecast(weatherInterval, new Date(), avgSpeed);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className={cn(layout.flexCol, 'h-full min-h-screen')}>
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-border/20 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary">SunRide</h1>
                <p className="text-sm text-muted-foreground">
                  Plan your routes with detailed weather forecasts
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className={cn(layout.flexCol, 'flex-1 container mx-auto px-4 py-6 gap-6')}>
          {/* GPX Upload Section */}
          <div className="w-full">
            <SimpleGPXUploader
              onGPXLoaded={handleGPXLoaded}
              isLoading={isLoading || isGenerating}
            />
          </div>

          {/* Weather Controls */}
          {gpxData && (
            <div className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle>Weather Forecast Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="weather-interval" className="text-sm font-medium">
                        Interval (km)
                      </label>
                      <input
                        id="weather-interval"
                        type="number"
                        value={weatherInterval}
                        onChange={e => setWeatherInterval(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        min="1"
                        max="50"
                        aria-label="Weather forecast interval in kilometers"
                      />
                    </div>
                    <div>
                      <label htmlFor="avg-speed" className="text-sm font-medium">
                        Speed (km/h)
                      </label>
                      <input
                        id="avg-speed"
                        type="number"
                        value={avgSpeed}
                        onChange={e => setAvgSpeed(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        min="1"
                        max="100"
                        aria-label="Average speed in kilometers per hour"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleGenerateForecast}
                        disabled={isLoading || isGenerating}
                        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isGenerating ? 'Generating...' : 'Generate Forecast'}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trip Summary */}
          {gpxData && forecastPoints.length > 0 && weatherData.length > 0 && (
            <div className="w-full">
              <ModernTripSummary
                gpxData={gpxData}
                forecastPoints={forecastPoints}
                weatherData={weatherData}
              />
            </div>
          )}

          {/* Main Content Grid */}
          {gpxData && (
            <div className={cn(responsive.grid, 'gap-6 flex-1')}>
              {/* Map Section */}
              <div className="lg:col-span-2">
                <Card className="h-full min-h-[500px] overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Route Map</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-[calc(100%-4rem)]">
                    <ModernMap
                      gpxData={gpxData}
                      forecastPoints={forecastPoints}
                      weatherData={weatherData}
                      onMarkerClick={handleMapMarkerClick}
                      selectedMarker={selectedTimelineMarker}
                      className="h-full"
                      glass={true}
                      bordered={false}
                      shadowed={false}
                      rounded={false}
                      showControls={true}
                      showFullscreenButton={true}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Section */}
              <div className="lg:col-span-1">
                <Card className="h-full min-h-[500px] overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Weather Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 h-[calc(100%-4rem)]">
                    <ModernTimeline
                      forecastPoints={forecastPoints}
                      weatherData={weatherData}
                      selectedMarker={selectedTimelineMarker}
                      onTimelineClick={handleTimelineClick}
                      className="h-full"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Weather Charts Section */}
          {gpxData && forecastPoints.length > 0 && weatherData.length > 0 && (
            <div className="w-full">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Weather Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ClientSideCharts
                    gpxData={gpxData}
                    forecastPoints={forecastPoints}
                    weatherData={weatherData}
                    selectedMarker={selectedTimelineMarker}
                    onChartClick={handleTimelineClick}
                    className="h-[500px]"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* No Data State */}
          {!gpxData && (
            <div className="flex-1 flex items-center justify-center">
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Welcome to SunRide</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload a GPX file to get started with weather forecasting for your route.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your route will appear on the map with detailed weather information along the
                    way.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
