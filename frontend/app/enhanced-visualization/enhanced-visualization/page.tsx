'use client';

import React, { useState, useEffect } from 'react';
import { useWeather } from '@frontend/features/weather/context';
import EnhancedClientCharts from '@frontend/features/charts/components/EnhancedClientCharts';
import { Button } from '@frontend/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@frontend/components/ui/tabs';
import { Loader2, Upload, AlertTriangle, Info } from 'lucide-react';
import GPXUploader from '@frontend/features/gpx/components/GPXUploader';
import { Alert, AlertDescription, AlertTitle } from '@frontend/components/ui/alert';
import { useRouter } from 'next/navigation';

export default function EnhancedVisualizationPage() {
  const { gpxData, isLoading, error, weatherData, forecastPoints, selectedMarker, setSelectedMarker } = useWeather();
  const router = useRouter();

  useEffect(() => {
    // Reset selected marker when data changes
    setSelectedMarker(null);
  }, [gpxData, weatherData, setSelectedMarker]);

  const handleMarkerClick = (index: number) => {
    setSelectedMarker(index);
  };

  const hasError = !!error;
  const hasData = gpxData && gpxData.points && gpxData.points.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enhanced Visualization</h1>
            <p className="text-muted-foreground mt-1">
              Visualize your route with detailed weather and elevation data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              Standard View
            </Button>
            <GPXUploader />
          </div>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading data...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {hasError && !isLoading && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {gpxError || weatherError || 'An error occurred while loading data'}
            </AlertDescription>
          </Alert>
        )}

        {!hasData && !isLoading && !hasError && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Route Data</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Upload a GPX file to visualize your route with detailed weather and elevation data
              </p>
              <GPXUploader />
            </CardContent>
          </Card>
        )}

        {hasData && !isLoading && !hasError && (
          <>
            <div className="grid grid-cols-1 gap-6">
              <Card className="overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle>Route Map</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] w-full bg-muted/20 flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-muted-foreground">Map view is not available in this version.</p>
                      <p className="text-sm text-muted-foreground mt-2">Please use the charts below to visualize your data.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <EnhancedClientCharts
                gpxData={gpxData}
                forecastPoints={forecastPoints}
                weatherData={weatherData}
                selectedMarker={selectedMarker}
                onChartClick={handleMarkerClick}
                height="h-[400px]"
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Enhanced Visualization</AlertTitle>
              <AlertDescription>
                This view provides advanced visualization features including interactive charts,
                detailed weather data, and elevation profiles. Click on any point on the map or
                charts to see detailed information.
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </div>
  );
}
