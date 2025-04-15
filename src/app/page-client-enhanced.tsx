'use client';

import { useRef } from 'react';
import { Clock, Map, Map as MapIcon, Upload, CloudRain, BarChart, ArrowRight, LineChart } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Import from feature folders
import { useWeather } from '@/features/weather/context';
import { WeatherProviderComparison } from '@/features/weather/components';
import { GPXUploader } from '@/features/gpx/components';
import { RouteControls } from '@/features/route/components';
import { useNotifications } from '@/features/notifications/context';

// Import UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  FadeIn,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  StaggerContainer
} from '@/components/ui/motion';
import { MotionCard, MotionCardHeader, MotionCardTitle, MotionCardContent } from '@/components/ui/motion-card';

// Import layout components
import { ResponsiveLayout } from '@/components/layout/responsive-layout';

// Import map and chart components
import MapWrapper from '@/components/map/MapWrapper';
import EnhancedLeafletMap from '@/features/map/components/EnhancedLeafletMap';
import { ClientSideTimeline } from '@/components/timeline/ClientSideTimeline';
import { ClientSideCharts } from '@/components/charts/ClientSideCharts';
import EnhancedClientCharts from '@/features/charts/components/EnhancedClientCharts';
import { WeatherAlerts } from '@/components/weather/WeatherAlerts';
import { TripSummary } from '@/components/route/TripSummary';
import { UserGuide } from '@/components/help/UserGuide';
import { cn } from '@/lib/utils';

// Import types
import { GPXData } from '@/types';

export default function HomeEnhanced() {
  const {
    gpxData,
    forecastPoints,
    weatherData,
    selectedMarker,
    setGpxData,
    setSelectedMarker,
    generateWeatherForecast,
    isLoading,
    isGenerating,
    loadingMessage,
  } = useWeather();

  const { addNotification } = useNotifications();

  // Refs for PDF export
  const mapRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  // Handle GPX file upload
  const handleGPXLoaded = (data: GPXData) => {
    setGpxData(data);

    // Use default values for weatherInterval, startTime, and avgSpeed
    const weatherInterval = 5; // 5 km intervals
    const startTime = new Date(); // Current time
    const avgSpeed = 20; // 20 km/h

    generateWeatherForecast(weatherInterval, startTime, avgSpeed);
    addNotification({
      title: 'GPX File Loaded',
      message: 'Your route has been loaded successfully.',
      type: 'success',
    });
  };

  // Handle route settings update
  const handleUpdateSettings = () => {
    if (gpxData) {
      // Use default values for weatherInterval, startTime, and avgSpeed
      const weatherInterval = 5; // 5 km intervals
      const startTime = new Date(); // Current time
      const avgSpeed = 20; // 20 km/h

      generateWeatherForecast(weatherInterval, startTime, avgSpeed);
      addNotification({
        title: 'Settings Updated',
        message: 'Your route settings have been updated.',
        type: 'info',
      });
    }
  };

  // Handle timeline click
  const handleTimelineClick = (index: number) => {
    setSelectedMarker(index);
  };

  // Handle chart click
  const handleChartClick = (index: number) => {
    setSelectedMarker(index);
  };

  // Handle marker click
  const handleMarkerClick = (index: number) => {
    setSelectedMarker(index);
  };

  // Create sidebar content
  const sidebarContent = (
    <StaggerContainer className="space-y-4">
      <FadeInLeft>
        <GPXUploader
          onGPXLoaded={handleGPXLoaded}
          isLoading={isGenerating}
          showProgress={true}
          showSuccess={true}
          helpText="Upload a GPX file to visualize your route with detailed weather forecasts"
        />
      </FadeInLeft>

      <FadeInLeft delay={0.1}>
        <RouteControls
          onUpdateSettings={handleUpdateSettings}
          onExportPDF={() => {}}
          isGenerating={isGenerating}
          isExporting={false}
        />
      </FadeInLeft>

      <FadeInLeft delay={0.2}>
        <WeatherProviderComparison />
      </FadeInLeft>
    </StaggerContainer>
  );

  // Create header content
  const headerContent = (
    <FadeIn>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">RideWeather Planner</h1>
            <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full border border-primary/20">
              Enhanced
            </span>
          </div>
          <p className="text-muted-foreground">
            Plan your routes with detailed weather forecasts and enhanced visualizations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/about">
              <span>About</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/design-system">
              <span>Design System</span>
            </Link>
          </Button>
        </div>
      </div>
    </FadeIn>
  );

  return (
    <ResponsiveLayout
      sidebarContent={sidebarContent}
      headerContent={headerContent}
      sidebarTitle="Route Controls"
      sidebarIcon={<MapIcon className="h-5 w-5 text-primary" />}
      sidebarCollapsible={true}
      sidebarDefaultCollapsed={false}
    >
      <div className="space-y-6">
        {isLoading ? (
          <FadeIn>
            <div className="flex items-center justify-center h-[500px] bg-muted/30 rounded-lg border border-border">
              <div className="text-center space-y-4">
                <LoadingSpinner
                  message={loadingMessage || 'Loading enhanced visualization...'}
                  centered
                  variant="spinner"
                  withContainer
                  size="lg"
                />
                <p className="text-muted-foreground animate-pulse">Preparing interactive map and charts...</p>
              </div>
            </div>
          </FadeIn>
        ) : (
          <>
            <FadeInUp>
              <div ref={mapRef} className="relative">
                <div className="h-[500px] rounded-lg overflow-hidden border border-border">
                  <EnhancedLeafletMap
                    gpxData={gpxData}
                    forecastPoints={forecastPoints}
                    weatherData={weatherData}
                    onMarkerClick={handleMarkerClick}
                    selectedMarker={selectedMarker}
                  />
                </div>
              </div>
            </FadeInUp>

            {forecastPoints.length > 0 && weatherData.length > 0 && (
              <StaggerContainer className="space-y-6">
                <FadeInUp delay={0.1}>
                  <TripSummary
                    gpxData={gpxData}
                    forecastPoints={forecastPoints}
                    weatherData={weatherData}
                  />
                </FadeInUp>

                <FadeInUp delay={0.2}>
                  <ClientSideTimeline
                    forecastPoints={forecastPoints}
                    weatherData={weatherData}
                    selectedMarker={selectedMarker}
                    onTimelineClick={handleTimelineClick}
                    height="h-[150px]"
                    showNavigation={true}
                  />
                </FadeInUp>

                <FadeInUp delay={0.3}>
                  <WeatherAlerts
                    forecastPoints={forecastPoints}
                    weatherData={weatherData}
                    maxInitialAlerts={3}
                    compact={true}
                  />
                </FadeInUp>

                <FadeInUp delay={0.4}>
                  <div ref={chartsRef}>
                    <EnhancedClientCharts
                      gpxData={gpxData}
                      forecastPoints={forecastPoints}
                      weatherData={weatherData}
                      selectedMarker={selectedMarker}
                      onChartClick={handleChartClick}
                      height="h-[400px]"
                    />
                  </div>
                </FadeInUp>
              </StaggerContainer>
            )}
          </>
        )}

        <FadeInUp delay={0.5}>
          <UserGuide />
        </FadeInUp>

        <FadeInUp delay={0.6}>
          <MotionCard hover className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <MotionCardHeader>
              <MotionCardTitle className="flex items-center text-xl">
                <BarChart className="mr-2 h-5 w-5 text-primary" />
                Enhanced Visualization Active
              </MotionCardTitle>
            </MotionCardHeader>
            <MotionCardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center bg-primary/10 text-primary rounded-md p-3 border border-primary/20">
                  <div className="flex items-center">
                    <Map className="h-5 w-5 mr-2" />
                    <p className="font-medium">Enhanced visualization is now active in the main app!</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  You're now using the enhanced map and chart features. Try these advanced features:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <Map className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Map Features</h4>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        <li>Toggle temperature, wind, and elevation layers</li>
                        <li>View temperature heatmap</li>
                        <li>Analyze route segments</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <LineChart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Chart Features</h4>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        <li>Zoom and pan charts</li>
                        <li>Switch between chart types</li>
                        <li>Toggle between distance and time</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </MotionCardContent>
          </MotionCard>
        </FadeInUp>
      </div>
    </ResponsiveLayout>
  );
}
