'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Import the map component
import MapWrapper from '@/components/map/MapWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Mock data for testing
const mockGpxData = {
  name: 'Test Route',
  points: [
    { lat: 37.7749, lon: -122.4194, elevation: 0, time: new Date().toISOString() },
    { lat: 37.785, lon: -122.4, elevation: 10, time: new Date().toISOString() },
    { lat: 37.79, lon: -122.38, elevation: 20, time: new Date().toISOString() },
    { lat: 37.8, lon: -122.37, elevation: 30, time: new Date().toISOString() },
  ],
  totalDistance: 5000,
  totalElevationGain: 100,
  totalTime: 3600,
};

const mockForecastPoints = [
  { lat: 37.7749, lon: -122.4194, time: new Date().toISOString() },
  { lat: 37.785, lon: -122.4, time: new Date().toISOString() },
  { lat: 37.79, lon: -122.38, time: new Date().toISOString() },
  { lat: 37.8, lon: -122.37, time: new Date().toISOString() },
];

const mockWeatherData = [
  {
    temperature: 20,
    feelsLike: 22,
    humidity: 65,
    windSpeed: 10,
    windDirection: 180,
    precipitation: 0,
    cloudCover: 20,
    uvIndex: 5,
    visibility: 10000,
    pressure: 1013,
    weatherCode: 800,
    weatherDescription: 'Clear sky',
    weatherIcon: '01d',
    time: new Date().toISOString(),
  },
  {
    temperature: 22,
    feelsLike: 24,
    humidity: 60,
    windSpeed: 12,
    windDirection: 190,
    precipitation: 0,
    cloudCover: 30,
    uvIndex: 6,
    visibility: 10000,
    pressure: 1012,
    weatherCode: 801,
    weatherDescription: 'Few clouds',
    weatherIcon: '02d',
    time: new Date().toISOString(),
  },
  {
    temperature: 21,
    feelsLike: 23,
    humidity: 62,
    windSpeed: 11,
    windDirection: 185,
    precipitation: 0,
    cloudCover: 25,
    uvIndex: 5.5,
    visibility: 10000,
    pressure: 1012.5,
    weatherCode: 800,
    weatherDescription: 'Clear sky',
    weatherIcon: '01d',
    time: new Date().toISOString(),
  },
  {
    temperature: 19,
    feelsLike: 20,
    humidity: 70,
    windSpeed: 9,
    windDirection: 175,
    precipitation: 0.1,
    cloudCover: 40,
    uvIndex: 4,
    visibility: 9000,
    pressure: 1013,
    weatherCode: 802,
    weatherDescription: 'Scattered clouds',
    weatherIcon: '03d',
    time: new Date().toISOString(),
  },
];

export default function TestMapPage() {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  const handleMarkerClick = (index: number) => {
    console.log('Marker clicked:', index);
    setSelectedMarker(index);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Test Map Page</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Map Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] rounded-lg overflow-hidden border border-border">
            <MapWrapper
              gpxData={mockGpxData}
              forecastPoints={mockForecastPoints}
              weatherData={mockWeatherData}
              onMarkerClick={handleMarkerClick}
              selectedMarker={selectedMarker}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
        <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto max-h-[300px]">
          {JSON.stringify({ selectedMarker }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
