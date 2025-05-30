'use client';

import { SimpleGPXUploader } from '@/features/gpx/components';
import { MapWrapper } from '@/features/map/components';
import { Alerts } from '@/features/weather/components';
import { Header } from '@/components/layout/header';
import { useWeather } from '@/features/weather/context';
import type { GPXData } from '@/types';

export default function Home() {
  const {
    gpxData,
    forecastPoints,
    weatherData,
    setGpxData,
    isGenerating,
    generateWeatherForecast,
  } = useWeather();

  const handleGPXLoaded = (data: GPXData) => {
    console.log('GPX loaded:', data);
    setGpxData(data);

    // Automatically generate weather forecast with default settings
    // 5km intervals, starting now, 15 km/h average speed
    const startTime = new Date();
    generateWeatherForecast(5, startTime, 15);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="SunRide" />

      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SunRide Route Analysis</h1>
            <p className="text-muted-foreground">
              Upload your GPX file to analyze weather conditions along your route
            </p>
          </div>

          {!gpxData ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">Get Started</h2>
              <p className="text-muted-foreground mb-8">
                Upload a GPX file to begin analyzing weather conditions along your route
              </p>
              <div className="max-w-md mx-auto">
                <SimpleGPXUploader onGPXLoaded={handleGPXLoaded} isLoading={isGenerating} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Weather Alerts */}
              <Alerts forecastPoints={forecastPoints} weatherData={weatherData} />

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Map Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Route Map</h2>
                  <div className="rounded-lg border bg-card">
                    <MapWrapper />
                  </div>
                </div>

                {/* Weather Info Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Weather Information</h2>
                  <div className="rounded-lg border bg-card p-4">
                    {weatherData.length > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Weather data loaded for {weatherData.length} points. Click on the map to
                        view detailed weather information.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Weather information will be displayed here once data is loaded.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Route Summary */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Route Summary</h2>
                <div className="rounded-lg border bg-card p-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Total Points:</span>{' '}
                      {gpxData.points?.length || 0}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Route Name:</span>{' '}
                      {gpxData.name || 'Unnamed Route'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Weather Points:</span> {forecastPoints.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
