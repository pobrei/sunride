'use client';

import React, { useState } from 'react';
import MapWrapper from '@frontend/components/map/MapWrapper';
import { Button } from '@frontend/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GPXData, ForecastPoint } from '@shared/types';

interface WeatherDataPoint {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  cloudCover: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  time: string;
}

// Mock data for testing
const mockGpxData: GPXData = {
  name: 'Test Route',
  points: [
    { lat: 51.505, lon: -0.09, ele: 0, time: new Date().toISOString() },
    { lat: 51.51, lon: -0.1, ele: 10, time: new Date().toISOString() },
    { lat: 51.52, lon: -0.12, ele: 20, time: new Date().toISOString() },
    { lat: 51.53, lon: -0.14, ele: 30, time: new Date().toISOString() },
  ],
  tracks: [],
  totalDistance: 5000,
  totalElevationGain: 100,
  totalElevationLoss: 0,
  maxElevation: 30,
  minElevation: 0
};

const mockForecastPoints: ForecastPoint[] = [
  { lat: 51.505, lon: -0.09, distance: 0, index: 0 },
  { lat: 51.51, lon: -0.1, distance: 1000, index: 1 },
  { lat: 51.52, lon: -0.12, distance: 2000, index: 2 },
  { lat: 51.53, lon: -0.14, distance: 3000, index: 3 },
];

const mockWeatherData: WeatherDataPoint[] = [
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

export default function MapTestPage(): React.ReactNode {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  const handleMarkerClick = (index: number): void => {
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
        <h1 className="text-2xl font-bold">Simple Map Test</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Map Test (London)</CardTitle>
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
