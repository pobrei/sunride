'use client';

import React from 'react';
import { SimpleGPXUploader } from '@/features/gpx/components';
import { MapWrapper } from '@/features/map/components';
import { Alerts } from '@/features/weather/components';
import type { GPXData } from '@/types';
import { useWeather } from '@/features/weather/context';

interface MainContentProps {
  gpxData: GPXData | null;
  onGPXUpload: (data: GPXData) => void;
}

// Memoized components for performance
const MemoizedMapWrapper = React.memo(MapWrapper);
const MemoizedAlerts = React.memo(Alerts);

const MainContent = React.memo<MainContentProps>(({ gpxData, onGPXUpload }) => {
  const { forecastPoints, weatherData } = useWeather();
  if (!gpxData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Get Started</h2>
          <p className="text-muted-foreground mb-8">
            Upload a GPX file to begin analyzing weather conditions along your route
          </p>
          <div className="max-w-md mx-auto">
            <SimpleGPXUploader onUpload={onGPXUpload} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weather Alerts */}
      <MemoizedAlerts forecastPoints={forecastPoints} weatherData={weatherData} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Route Map</h2>
          <div className="rounded-lg border bg-card">
            <MemoizedMapWrapper />
          </div>
        </div>

        {/* Weather Info Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Weather Information</h2>
          <div className="rounded-lg border bg-card p-4">
            {weatherData.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                Weather data loaded for {weatherData.length} points. Click on the map or charts to
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

      {/* Additional Weather Data */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Route Summary</h2>
        <div className="rounded-lg border bg-card p-4">
          {gpxData ? (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Total Points:</span> {gpxData.points.length}
              </p>
              <p className="text-sm">
                <span className="font-medium">Route Name:</span> {gpxData.name || 'Unnamed Route'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Weather Points:</span> {forecastPoints.length}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Route analysis and summary will be displayed here once weather data is loaded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

MainContent.displayName = 'MainContent';

export { MainContent };
