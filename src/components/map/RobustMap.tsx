'use client';

import React, { useState, useEffect } from 'react';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import dynamic from 'next/dynamic';
import FallbackMap from './FallbackMap';

// Dynamically import OpenLayers map with no SSR
const OpenLayersMapFixed = dynamic(
  () => import('./OpenLayersMapFixed').catch(() => {
    console.error('Failed to load OpenLayersMapFixed component');
    return () => <FallbackMap />;
  }),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-muted/20 flex items-center justify-center">
        <LoadingSpinner 
          message="Loading map components..." 
          centered 
          variant="spinner"
          size="lg"
        />
      </div>
    ),
  }
);

interface RobustMapProps {
  /** GPX data containing route points */
  gpxData: GPXData | null;
  /** Forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Callback when a marker is clicked */
  onMarkerClick: (index: number) => void;
  /** Currently selected marker index */
  selectedMarker: number | null;
  /** Optional height class */
  height?: string;
  /** Optional additional class names */
  className?: string;
  /** Whether to show a placeholder when there's no data */
  showPlaceholder?: boolean;
}

/**
 * A robust map component that tries to use OpenLayers first and falls back to a simple map if needed
 */
export default function RobustMap({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker,
  height = 'h-[400px]',
  className = '',
  showPlaceholder = true
}: RobustMapProps) {
  const [useOpenLayers, setUseOpenLayers] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if OpenLayers is available
  useEffect(() => {
    const checkOpenLayers = async () => {
      try {
        // Try to import OpenLayers
        await import('ol');
        setUseOpenLayers(true);
      } catch (error) {
        console.error('OpenLayers not available, using fallback map:', error);
        setUseOpenLayers(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkOpenLayers();
  }, []);
  
  if (isLoading) {
    return (
      <div className={`${height} ${className} bg-muted/20 flex items-center justify-center rounded-lg border border-border`}>
        <LoadingSpinner 
          message="Initializing map..." 
          centered 
          variant="spinner"
          size="lg"
        />
      </div>
    );
  }
  
  // If there's no data and we should show a placeholder
  if (showPlaceholder && (!gpxData || forecastPoints.length === 0)) {
    return (
      <div className={`${height} ${className} bg-muted/10 flex items-center justify-center rounded-lg border border-border`}>
        <div className="text-center p-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">No Route Data</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Upload a GPX file to visualize your route on the map with weather data
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${height} ${className} rounded-lg border border-border overflow-hidden`}>
      {useOpenLayers ? (
        <OpenLayersMapFixed
          gpxData={gpxData}
          forecastPoints={forecastPoints}
          weatherData={weatherData}
          onMarkerClick={onMarkerClick}
          selectedMarker={selectedMarker}
        />
      ) : (
        <FallbackMap
          gpxData={gpxData}
          forecastPoints={forecastPoints}
          weatherData={weatherData}
          onMarkerClick={onMarkerClick}
          selectedMarker={selectedMarker}
        />
      )}
    </div>
  );
}
