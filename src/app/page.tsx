'use client';

import React, { useState } from 'react';
import { SimpleGPXUploader } from '@/features/gpx/components';
import { MapWrapper } from '@/features/map/components';
import { Alerts, WeatherInfoPanel, CollapsibleWeatherPanel } from '@/features/weather/components';
import { Header } from '@/components/layout/header';
import { useWeather } from '@/features/weather/context';
import type { GPXData } from '@/types';

// Import all the missing components
import { ClientSideCharts } from '@/components/charts';
import { ClientSideTimeline } from '@/features/timeline/components';
import { RouteControls, TripSummary } from '@/features/route/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, BarChart3, Clock, Route, Settings } from 'lucide-react';

export default function Home() {
  const {
    gpxData,
    forecastPoints,
    weatherData,
    setGpxData,
    isGenerating,
    generateWeatherForecast,
    selectedMarker,
    setSelectedMarker,
  } = useWeather();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [routeSettings, setRouteSettings] = useState({
    intervalKm: 5,
    startTime: new Date(),
    averageSpeed: 15,
  });

  const handleGPXLoaded = React.useCallback(
    (data: GPXData) => {
      console.log('GPX loaded:', data);
      setGpxData(data);

      // Automatically generate weather forecast with current settings
      generateWeatherForecast(
        routeSettings.intervalKm,
        routeSettings.startTime,
        routeSettings.averageSpeed
      );
    },
    [setGpxData, generateWeatherForecast, routeSettings]
  );

  const handleRouteSettingsUpdate = React.useCallback(
    (settings: typeof routeSettings) => {
      setRouteSettings(settings);
      if (gpxData) {
        generateWeatherForecast(settings.intervalKm, settings.startTime, settings.averageSpeed);
      }
    },
    [gpxData, generateWeatherForecast]
  );

  const handleMarkerClick = React.useCallback(
    (index: number) => {
      setSelectedMarker(index);
    },
    [setSelectedMarker]
  );

  const handleTimelineClick = React.useCallback(
    (index: number) => {
      setSelectedMarker(index);
    },
    [setSelectedMarker]
  );

  const handleChartClick = React.useCallback(
    (index: number) => {
      setSelectedMarker(index);
    },
    [setSelectedMarker]
  );

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

              {/* Route Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Route Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RouteControls
                    onUpdateSettings={settings => {
                      const newSettings = {
                        intervalKm: settings.weatherInterval,
                        startTime: settings.startTime,
                        averageSpeed: settings.avgSpeed,
                      };
                      handleRouteSettingsUpdate(newSettings);
                    }}
                    isGenerating={isGenerating}
                  />
                </CardContent>
              </Card>

              {/* Main Content Tabs */}
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="charts">Charts</TabsTrigger>
                  <TabsTrigger value="map">Map</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Trip Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Route className="h-5 w-5" />
                          Trip Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TripSummary
                          gpxData={gpxData}
                          forecastPoints={forecastPoints}
                          weatherData={weatherData}
                        />
                      </CardContent>
                    </Card>

                    {/* Weather Info Panel */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Weather Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedMarker !== null && selectedMarker < weatherData.length ? (
                          <WeatherInfoPanel
                            weatherData={weatherData[selectedMarker]}
                            forecastPoint={forecastPoints[selectedMarker]}
                          />
                        ) : (
                          <div className="text-center p-8 text-muted-foreground">
                            <p>
                              Click on a point in the timeline, chart, or map to view detailed
                              weather information
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Map Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Route Map</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] rounded-lg overflow-hidden">
                        <MapWrapper
                          onMarkerClick={handleMarkerClick}
                          selectedMarker={selectedMarker}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Weather Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[500px]">
                        <ClientSideTimeline
                          forecastPoints={forecastPoints}
                          weatherData={weatherData}
                          selectedMarker={selectedMarker}
                          onTimelineClick={handleTimelineClick}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Charts Tab */}
                <TabsContent value="charts" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Weather Charts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[600px]">
                        <ClientSideCharts
                          gpxData={gpxData}
                          forecastPoints={forecastPoints}
                          weatherData={weatherData}
                          selectedMarker={selectedMarker}
                          onChartClick={handleChartClick}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Map Tab */}
                <TabsContent value="map" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Interactive Map</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[600px] rounded-lg overflow-hidden">
                        <MapWrapper
                          onMarkerClick={handleMarkerClick}
                          selectedMarker={selectedMarker}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analysis Tab */}
                <TabsContent value="analysis" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Detailed Weather Panel */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Detailed Weather Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CollapsibleWeatherPanel />
                      </CardContent>
                    </Card>

                    {/* Route Statistics */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Route Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold">
                                {gpxData.points?.length || 0}
                              </div>
                              <div className="text-sm text-muted-foreground">Total Points</div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold">{forecastPoints.length}</div>
                              <div className="text-sm text-muted-foreground">Weather Points</div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Route Name:</span>
                              <span>{gpxData.name || 'Unnamed Route'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Distance:</span>
                              <span>
                                {gpxData.distance
                                  ? `${(gpxData.distance / 1000).toFixed(1)} km`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Elevation Gain:</span>
                              <span>
                                {gpxData.elevation?.gain
                                  ? `${gpxData.elevation.gain.toFixed(0)} m`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
