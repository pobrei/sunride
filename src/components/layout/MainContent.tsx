'use client';

import React from 'react';
import { SimpleGPXUploader } from '@/features/gpx/components/SimpleGPXUploader';
import { MapWrapper } from '@/features/map/components';
import { WeatherInfoPanel } from '@/features/weather/components';
import { Alerts } from '@/features/weather/components';
import type { GPXData } from '@/types';

interface MainContentProps {
  gpxData: GPXData | null;
  onGPXUpload: (data: GPXData) => void;
  onChartClick: (index: number) => void;
  showDescriptionsOnMobile?: boolean;
  showLabelsOnMobile?: boolean;
}

// Memoized components for performance
const MemoizedWeatherInfo = React.memo(WeatherInfoPanel);
const MemoizedMapWrapper = React.memo(MapWrapper);
const MemoizedAlerts = React.memo(Alerts);

const MainContent = React.memo<MainContentProps>(({ 
  gpxData, 
  onGPXUpload, 
  onChartClick,
  showDescriptionsOnMobile = true,
  showLabelsOnMobile = true
}) => {
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
      <MemoizedAlerts />

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
            <MemoizedWeatherInfo />
          </div>
        </div>
      </div>

      {/* Additional Weather Data */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Route Summary</h2>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground">
            Route analysis and summary will be displayed here once weather data is loaded.
          </p>
        </div>
      </div>
    </div>
  );
});

MainContent.displayName = 'MainContent';

export { MainContent };
