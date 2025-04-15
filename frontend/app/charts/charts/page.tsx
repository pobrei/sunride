'use client';

import React from 'react';
import { PageWrapper } from '@frontend/components/layout/page-wrapper';
import { useWeather } from '@frontend/features/weather/context';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { Button } from '@frontend/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BarChart } from 'lucide-react';
import { ClientSideCharts } from '@frontend/components/charts/ClientSideCharts';
import { cn } from '@shared/lib/utils';
import { typography, animation, effects, layout } from '@shared/styles/tailwind-utils';

export default function ChartsPage() {
  const { gpxData, forecastPoints, weatherData, selectedMarker, setSelectedMarker } = useWeather();

  const handleChartClick = (index: number) => {
    setSelectedMarker(index);
  };

  return (
    <PageWrapper>
      <div className={cn(layout.flexRow, "gap-2 mb-6", animation.fadeIn)}>
        <Button variant="outline" size="sm" asChild className={effects.buttonHover}>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <h1 className={cn(typography.h2)}>Weather Charts</h1>
      </div>

      {forecastPoints.length > 0 && weatherData.length > 0 ? (
        <Card className={cn(effects.cardHoverable, animation.fadeIn)}>
          <CardHeader className={cn("pb-2")}>
            <CardTitle className={typography.cardTitle}>Detailed Weather Charts</CardTitle>
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
        <Card className={cn(effects.cardHoverable, animation.fadeIn)}>
          <CardContent className={cn("p-8 text-center")}>
            <div className={cn("h-12 w-12 mx-auto mb-4 text-muted-foreground", animation.fadeIn)}>
              <BarChart className="h-12 w-12" />
            </div>
            <h2 className={cn(typography.h4, "mb-2")}>No Chart Data Available</h2>
            <p className={cn(typography.bodySm, typography.muted, "mb-4")}>
              Please upload a GPX file on the home page to view weather charts along your route.
            </p>
            <Button asChild className={cn(animation.buttonPress)}>
              <Link href="/">Go to Home Page</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </PageWrapper>
  );
}
