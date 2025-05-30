'use client';

/**
 * ModernMap Component
 *
 * This component provides a modern map interface following iOS 19 design principles.
 * It wraps the SimpleLeafletMap component with additional styling and features.
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GPXData, ForecastPoint, WeatherData } from '@/types';
import { Layers, Maximize, Minimize, Map } from 'lucide-react';
import { CenterMapButton } from './CenterMapButton';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Dynamically import the map component with no SSR
const DynamicLeafletMap = dynamic(() => import('./SimpleLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-lg border border-border/20">
      <div className="flex flex-col items-center justify-center">
        <LoadingSpinner variant="train" size="md" />
        <p className="text-sm text-muted-foreground font-medium mt-2">Loading map...</p>
      </div>
    </div>
  ),
});

interface ModernMapProps {
  /** GPX data containing route information */
  gpxData: GPXData | null;
  /** Array of forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Callback for when a marker is clicked */
  onMarkerClick: (index: number) => void;
  /** Index of the currently selected marker */
  selectedMarker: number | null;
  /** Additional class names */
  className?: string;
  /** Whether to show a glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
  /** Whether to show controls */
  showControls?: boolean;
  /** Whether to show a fullscreen button */
  showFullscreenButton?: boolean;
  /** Whether to show a legend */
  showLegend?: boolean;
  /** Legend items */
  legendItems?: Array<{ color: string; label: string }>;
}

/**
 * A modern map component that follows iOS 19 design principles
 */
export function ModernMap({
  gpxData,
  forecastPoints,
  weatherData,
  onMarkerClick,
  selectedMarker,
  className,
  glass = true,
  bordered = true,
  shadowed = true,
  rounded = true,
  showControls = true,
  showFullscreenButton = true,
  showLegend = false,
  legendItems = [],
}: ModernMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // No data content
  const noDataContent = (
    <Card
      className={cn(
        "h-full w-full flex items-center justify-center",
        className
      )}
      variant={glass ? 'glass' : 'default'}
    >
      <div className="text-center p-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
          <Map className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No Route Data</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Upload a GPX file to see your route on the map with weather data
        </p>
      </div>
    </Card>
  );

  return (
    <div
      className={cn(
        "relative",
        isFullscreen ? "fixed inset-0 z-50 p-4 bg-background/80 backdrop-blur-sm" : "h-full w-full",
        className
      )}
    >
      {/* Map container */}
      <Card
        className={cn(
          "h-full w-full overflow-hidden",
          {
            "border-none": isFullscreen,
            "border border-border/20": bordered && !isFullscreen,
            "shadow-sm": shadowed && !isFullscreen,
            "rounded-xl": rounded && !isFullscreen,
          }
        )}
        variant={glass ? 'glass' : 'default'}
      >
        {/* Map content */}
        {!gpxData || forecastPoints.length === 0 ? (
          noDataContent
        ) : (
          <div className="h-full w-full relative">
            <DynamicLeafletMap
              gpxData={gpxData}
              forecastPoints={forecastPoints}
              weatherData={weatherData}
              onMarkerClick={onMarkerClick}
              selectedMarker={selectedMarker}
            />

            {/* Map controls */}
            {showControls && (
              <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
                {showFullscreenButton && (
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    className="bg-card/80 backdrop-blur-sm shadow-sm"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                )}
                <CenterMapButton
                  variant="secondary"
                  size="icon-sm"
                  className="bg-card/80 backdrop-blur-sm shadow-sm"
                />
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="bg-card/80 backdrop-blur-sm shadow-sm"
                  onClick={() => {
                    // Toggle layer control
                    const layerControl = document.querySelector('.leaflet-control-layers') as HTMLElement;
                    if (layerControl) {
                      layerControl.click();
                    }
                  }}
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Legend */}
            {showLegend && legendItems.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm p-2 rounded-md shadow-sm border border-border/20 z-10">
                <div className="text-xs font-medium mb-1">Legend</div>
                <div className="flex flex-col gap-1">
                  {legendItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default ModernMap;
