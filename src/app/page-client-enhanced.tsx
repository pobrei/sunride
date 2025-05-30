'use client';

// Import from feature folders
import { SimpleGPXUploader } from '@/features/gpx/components';

// Import layout components
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/layout/PageHeader';
import { MainContent } from '@/components/layout/MainContent';

// Import custom hooks
import { useRouteManager } from '@/hooks/useRouteManager';

export default function Home() {
  const {
    // State
    gpxData,
    uploadSteps,
    activeStep,

    // Handlers
    handleGPXUpload,
    handleChartClick,
  } = useRouteManager();

  // Create controls content
  const controlsContent = (
    <div className="space-y-4">
      <SimpleGPXUploader onUpload={handleGPXUpload} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="SunRide" />

      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-6 pb-12 sm:pb-16 md:pb-24">
        <PageHeader gpxData={gpxData} uploadSteps={uploadSteps} activeStep={activeStep} />

        {/* Mobile-first layout with logical order of components */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-3 sm:mt-6 animate-fade-in">
          {/* On mobile: Controls first for better UX */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4 order-1 lg:order-1 animate-slide-in-left">
            {/* Controls content - always visible at the top on mobile */}
            {controlsContent}
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6 order-2 lg:order-2 animate-slide-in-right">
            <MainContent
              gpxData={gpxData}
              onGPXUpload={handleGPXUpload}
              onChartClick={handleChartClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
