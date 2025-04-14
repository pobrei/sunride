'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useWeather } from '@/features/weather/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ClientSideCharts } from '@/components/charts/ClientSideCharts';

export default function ChartsPage() {
  const {
    gpxData,
    forecastPoints,
    weatherData,
    selectedMarker,
    setSelectedMarker,
  } = useWeather();

  const handleChartClick = (index: number) => {
    setSelectedMarker(index);
  };

  return (
    <PageWrapper>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Weather Charts</h1>
      </div>

      {forecastPoints.length > 0 && weatherData.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Detailed Weather Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientSideCharts
              gpxData={gpxData}
              forecastPoints={forecastPoints}
              weatherData={weatherData}
              selectedMarker={selectedMarker}
              onChartClick={handleChartClick}
              height="h-[600px]"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground">📊</div>
            <h2 className="text-xl font-medium mb-2">No Chart Data Available</h2>
            <p className="text-muted-foreground mb-4">
              Please upload a GPX file on the home page to view weather charts along your route.
            </p>
            <Button asChild>
              <Link href="/">Go to Home Page</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}
