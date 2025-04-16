'use client';

import { useRef } from 'react';
import { Map as MapIcon, Upload, CloudRain, BarChart } from 'lucide-react';
import gsap from 'gsap';

// Import from feature folders
import { useWeather } from '@frontend/features/weather/context';
import { WeatherProviderComparison } from '@frontend/features/weather/components';
import { RouteControls } from '@frontend/features/route/components';
import { PDFExport } from '@frontend/features/export/components';
import { KeyboardNavigation } from '@frontend/features/navigation/components';
import { useNotifications } from '@frontend/features/notifications/context';

// Import from components
import { ThemeToggle } from '@frontend/components/ui/theme-toggle';
import { Breadcrumb } from '@frontend/components/ui/breadcrumb';
import { ProgressSteps } from '@frontend/components/ui/progress-steps';

// Import types
import type { GPXData, RouteSettings } from '@shared/types';

// Import UI components
import { LoadingSpinner } from '@frontend/components/ui/LoadingSpinner';
import GPXUploader from '@frontend/components/GPXUploader';

// Import layout components
import { ResponsiveLayout } from '@frontend/components/layout/responsive-layout';

// Import the map component
import MapWrapper from '@frontend/components/map/MapWrapper';
import { ClientSideTimeline } from '@frontend/components/timeline/ClientSideTimeline';
import { WeatherAlerts } from '@frontend/components/weather/WeatherAlerts';
import { TripSummary as RouteSummary } from '@frontend/components/route/TripSummary';
import { UserGuide } from '@frontend/components/help/UserGuide';

// Import enhanced charts
import EnhancedClientCharts from '@frontend/features/charts/components/EnhancedClientCharts';

export default function Home() {
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

  // PDF export component props
  const pdfExportProps = {
    gpxData,
    forecastPoints,
    weatherData,
    mapRef: mapRef as React.RefObject<HTMLDivElement>,
    chartsRef: chartsRef as React.RefObject<HTMLDivElement>,
  };

  // Handle GPX file upload
  const handleGPXLoaded = (data: GPXData) => {
    setGpxData(data);
    setSelectedMarker(null);

    // Show success notification
    addNotification(
      'success',
      `Route loaded successfully: ${data.name || 'Unnamed route'} (${data.points.length} points)`
    );

    // Wait for component to render before animating
    setTimeout(() => {
      const mapContainer = document.querySelector('.map-container');
      if (mapContainer) {
        gsap.fromTo(
          '.map-container',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
      }
    }, 0);
  };

  // Handle route settings update
  const handleUpdateSettings = async (settings: RouteSettings) => {
    // Use the generateWeatherForecast function from context
    await generateWeatherForecast(settings.weatherInterval, settings.startTime, settings.avgSpeed);
  };

  // Handle marker click on map
  const handleMarkerClick = (index: number) => {
    setSelectedMarker(index);
  };

  // Handle timeline click
  const handleTimelineClick = (index: number) => {
    setSelectedMarker(index);
  };

  // Handle chart click
  const handleChartClick = (index: number) => {
    setSelectedMarker(index);
  };

  // Define the processing steps for GPX upload
  const uploadSteps = [
    {
      label: 'Upload GPX',
      description: 'Select and upload a GPX file',
      status: gpxData ? 'complete' : 'pending',
      icon: <Upload className="h-3 w-3" />,
    },
    {
      label: 'Process Route',
      description: 'Extract route data from GPX',
      status: gpxData ? 'complete' : 'pending',
      icon: <MapIcon className="h-3 w-3" />,
    },
    {
      label: 'Get Weather',
      description: 'Fetch weather data for route points',
      status: isGenerating ? 'in-progress' : weatherData.length > 0 ? 'complete' : 'pending',
      icon: <CloudRain className="h-3 w-3" />,
    },
    {
      label: 'Visualize',
      description: 'Display route with weather data',
      status: forecastPoints.length > 0 && weatherData.length > 0 ? 'complete' : 'pending',
      icon: <BarChart className="h-3 w-3" />,
    },
  ];

  // Determine the active step
  const getActiveStep = () => {
    if (!gpxData) return 0;
    if (gpxData && !weatherData.length) return 1;
    if (isGenerating) return 2;
    if (forecastPoints.length > 0 && weatherData.length > 0) return 3;
    return 0;
  };

  // Create sidebar content
  const sidebarContent = (
    <div className="space-y-4">
      <GPXUploader
        onGPXLoaded={handleGPXLoaded}
        isLoading={isGenerating}
        showProgress={true}
        showSuccess={true}
        helpText="Upload a GPX file to visualize your route with detailed weather forecasts"
      />
      <RouteControls
        onUpdateSettings={handleUpdateSettings}
        onExportPDF={() => {}}
        isGenerating={isGenerating}
        isExporting={false}
      />
      <WeatherProviderComparison />
    </div>
  );

  // Create header content with breadcrumb and progress steps
  const headerContent = (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <Breadcrumb
          segments={[
            { label: 'Home', href: '/' },
            { label: 'Route Planner', href: '#' },
          ]}
        />
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <PDFExport {...pdfExportProps} />
        </div>
      </div>

      {gpxData && (
        <ProgressSteps
          steps={uploadSteps}
          activeStep={getActiveStep()}
          showStepNumbers={false}
          showDescriptions={true}
          className="mt-2"
        />
      )}
    </div>
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
          <div className="flex items-center justify-center h-[500px] bg-muted/30 rounded-lg border border-border">
            <LoadingSpinner
              message={loadingMessage || 'Loading weather data...'}
              centered
              variant="spinner"
              withContainer
              size="lg"
            />
          </div>
        ) : (
          <>
            <div ref={mapRef} className="relative">
              <div className="h-[500px] rounded-lg overflow-hidden border border-border">
                <MapWrapper
                  gpxData={gpxData}
                  forecastPoints={forecastPoints}
                  weatherData={weatherData}
                  onMarkerClick={handleMarkerClick}
                  selectedMarker={selectedMarker}
                />
              </div>

              {forecastPoints.length > 0 && (
                <KeyboardNavigation
                  onNavigate={direction => console.log(`Navigate ${direction}`)}
                  onZoom={direction => console.log(`Zoom ${direction}`)}
                  onSelectMarker={handleMarkerClick}
                  markerCount={forecastPoints.length}
                />
              )}
            </div>

            {forecastPoints.length > 0 && weatherData.length > 0 && (
              <div className="space-y-6">
                <RouteSummary
                  gpxData={gpxData}
                  forecastPoints={forecastPoints}
                  weatherData={weatherData}
                  className="opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]"
                />

                <ClientSideTimeline
                  forecastPoints={forecastPoints}
                  weatherData={weatherData}
                  selectedMarker={selectedMarker}
                  onTimelineClick={handleTimelineClick}
                  height="h-[150px]"
                  showNavigation={true}
                />

                <WeatherAlerts
                  forecastPoints={forecastPoints}
                  weatherData={weatherData}
                  maxInitialAlerts={3}
                  compact={true}
                  className="opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]"
                />

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
              </div>
            )}
          </>
        )}

        <UserGuide className="opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]" />
      </div>
    </ResponsiveLayout>
  );
}
