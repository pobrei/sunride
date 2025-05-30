'use client';

import { useRef } from 'react';
import { Map as MapIcon, Upload, CloudRain, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { layout } from '@/styles/tailwind-utils';
import gsap from 'gsap';

// Import from feature folders
import { useWeather } from '@/features/weather/context';
import { WeatherProviderComparison } from '@/features/weather/components';
import { RouteControls } from '@/features/route/components';
import { ExportMenu } from '@/features/export/components';
import { KeyboardNavigation } from '@/features/navigation/components';
import { useNotifications } from '@/features/notifications/context';

// Import from components
import { EnhancedThemeToggle } from '@/components/ui/enhanced-theme-toggle';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ProgressSteps } from '@/components/ui/progress-steps';

// Import types
import type { GPXData, RouteSettings } from '@/types';

// Import UI components
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GPXUploader } from '@/features/gpx/components';

// Import layout components
import { Header } from '@/components/layout/header';

// Import the map component
import MapWrapper from '@/components/map/MapWrapper';
import { ModernClientTimeline } from '@/components/timeline/ModernClientTimeline';
import { Alerts as WeatherAlerts } from '@/features/weather/components';
import { ModernTripSummary as RouteSummary } from '@/features/route/components';
import { UserGuide } from '@/features/help/components';

// Import charts
import ClientSideCharts from '@/components/charts/ClientSideCharts';

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
    console.log('handleGPXLoaded called with data:', data.name, `${data.points.length} points`);

    setGpxData(data);
    console.log('setGpxData completed');

    setSelectedMarker(null);
    console.log('setSelectedMarker completed');

    // Show success notification
    addNotification(
      'success',
      `Route loaded successfully: ${data.name || 'Unnamed route'} (${data.points.length} points)`
    );
    console.log('Success notification added');

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
    console.log('handleUpdateSettings called with:', settings);
    // Use the generateWeatherForecast function from context
    try {
      await generateWeatherForecast(
        settings.weatherInterval,
        settings.startTime,
        settings.avgSpeed
      );
      console.log('Weather forecast generated successfully');
    } catch (error) {
      console.error('Error generating weather forecast:', error);
      addNotification('error', 'Failed to generate weather forecast');
    }
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

  // Create controls content
  const controlsContent = (
    <div className="space-y-4">
      <GPXUploader
        onGPXLoaded={handleGPXLoaded}
        isLoading={isGenerating}
        showProgress={true}
        showSuccess={true}
        helpText="Upload a GPX file to visualize your route with detailed weather forecasts"
      />
      <RouteControls onUpdateSettings={handleUpdateSettings} isGenerating={isGenerating} />
      <WeatherProviderComparison forecastPoints={forecastPoints} />
    </div>
  );

  // Create header content with breadcrumb and progress steps
  const headerContent = (
    <div className="flex flex-col space-y-3 sm:space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        {/* Hide breadcrumb on smallest screens */}
        <div className="hidden sm:block">
          <Breadcrumb
            segments={[
              { label: 'Home', href: '/' },
              { label: 'Route Planner', href: '#' },
            ]}
          />
        </div>
        {/* Show simplified title on smallest screens */}
        <div className="sm:hidden text-sm font-medium">Route Planner</div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <EnhancedThemeToggle />
          <ExportMenu {...pdfExportProps} />
        </div>
      </div>

      {gpxData && (
        <ProgressSteps
          steps={uploadSteps}
          activeStep={getActiveStep()}
          showStepNumbers={false}
          showDescriptions={false}
          showDescriptionsOnMobile={false}
          showLabelsOnMobile={true}
          className="mt-2"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="SunRide" />

      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-6 pb-12 sm:pb-16 md:pb-24">
        {headerContent}

        {/* Mobile-first layout with logical order of components */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-3 sm:mt-6 animate-fade-in">
          {/* On mobile: Controls first for better UX */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4 order-1 lg:order-1 animate-slide-in-left">
            {/* Controls content - always visible at the top on mobile */}
            {controlsContent}
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6 order-2 lg:order-2 animate-slide-in-right">
            {isLoading ? (
              <div className="flex items-center justify-center h-[320px] sm:h-[350px] md:h-[450px] bg-card rounded-lg border border-border shadow-sm animate-scale-up">
                <LoadingSpinner
                  message={loadingMessage || 'Loading weather data...'}
                  centered
                  variant="train"
                  withContainer
                  size="lg"
                />
              </div>
            ) : (
              <>
                {/* Map - most important visual element */}
                <div className="relative" ref={mapRef}>
                  <div className="h-[320px] sm:h-[350px] md:h-[450px] rounded-lg overflow-hidden border border-border shadow-sm animate-scale-up">
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
                      onSelectMarker={index => index !== null && handleMarkerClick(index)}
                      markerCount={forecastPoints.length}
                    />
                  )}
                </div>

                {forecastPoints.length > 0 && weatherData.length > 0 && (
                  <div
                    className={cn(
                      'space-y-3 sm:space-y-4 md:space-y-6 mt-3 sm:mt-4 md:mt-6 animate-slide-up'
                    )}
                  >
                    {/* Summary and alerts - stacked on mobile, side by side on larger screens */}
                    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4')}>
                      <div className="w-full overflow-hidden rounded-xl">
                        <RouteSummary
                          gpxData={gpxData}
                          forecastPoints={forecastPoints}
                          weatherData={weatherData}
                          className="animate-fade-in stagger-item"
                        />
                      </div>

                      <WeatherAlerts
                        forecastPoints={forecastPoints}
                        weatherData={weatherData}
                        maxInitialAlerts={3}
                        compact={true}
                        className="animate-fade-in stagger-item rounded-lg shadow-sm hover:shadow-md transition-all duration-300 card-hover-effect"
                      />
                    </div>

                    {/* Modern iOS 19-style Timeline */}
                    <div className="w-full overflow-hidden rounded-xl border border-border/20">
                      <ModernClientTimeline
                        forecastPoints={forecastPoints}
                        weatherData={weatherData}
                        selectedMarker={selectedMarker}
                        onTimelineClick={handleTimelineClick}
                        height="h-[420px] sm:h-[440px] md:h-[460px] lg:h-[480px]"
                        showNavigation={true}
                        className="border-0"
                      />
                    </div>

                    {/* Charts - adjusted padding and height for mobile */}
                    <div
                      ref={chartsRef}
                      className="mb-4 sm:mb-6 md:mb-8 w-full overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-border/20 bg-white/30 dark:bg-card/30 backdrop-blur-sm p-2 sm:p-3 animate-fade-in stagger-item"
                    >
                      <div className="w-full overflow-hidden rounded-xl">
                        <ClientSideCharts
                          gpxData={gpxData}
                          forecastPoints={forecastPoints}
                          weatherData={weatherData}
                          selectedMarker={selectedMarker}
                          onChartClick={handleChartClick}
                          height="h-[420px] sm:h-[450px] md:h-[480px] lg:h-[500px]"
                          className="border-0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* User guide - moved to the bottom as it's less critical */}
                <div className={cn('mt-3 sm:mt-4 md:mt-6')}>
                  <UserGuide
                    className={cn(
                      'animate-fade-in stagger-item rounded-lg shadow-sm hover:shadow-md transition-all duration-300 card-hover-effect'
                    )}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
