'use client';

import React, { useState, useEffect } from 'react';
import { ForecastPoint, WeatherData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Wind, CloudRain, Snowflake, Sun, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { formatTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { typography, animation, layout } from '@/styles/tailwind-utils';

interface WeatherAlertsProps {
  /** Forecast points along the route */
  forecastPoints: ForecastPoint[];
  /** Weather data for each forecast point */
  weatherData: (WeatherData | null)[];
  /** Optional className for styling */
  className?: string;
  /** Maximum number of alerts to show initially */
  maxInitialAlerts?: number;
  /** Whether to show compact alerts */
  compact?: boolean;
}

interface Alert {
  id: string;
  type: 'extremeHeat' | 'freezing' | 'highWind' | 'heavyRain';
  title: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  icon: React.ReactNode;
  timestamp: string;
  location: string;
  details: string;
  pointIndex: number;
  value: string;
}

/**
 * A component that displays weather alerts for the route
 */
export function WeatherAlerts({
  forecastPoints,
  weatherData,
  className,
  maxInitialAlerts = 3,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  compact = true,
}: WeatherAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showAll, setShowAll] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Generate alerts based on weather data
  useEffect(() => {
    if (
      !forecastPoints ||
      !weatherData ||
      forecastPoints.length === 0 ||
      weatherData.length === 0
    ) {
      setAlerts([]);
      return;
    }

    const newAlerts: Alert[] = [];

    // Check each forecast point for potential weather alerts
    forecastPoints.forEach((point, index) => {
      const weather = weatherData[index];
      if (!weather) return;

      // Check for extreme heat
      if (weather.temperature > 35) {
        newAlerts.push({
          id: `heat-${index}`,
          type: 'extremeHeat',
          title: 'Extreme Heat Warning',
          description: `Temperature of ${Math.round(weather.temperature)}°C expected at ${formatTime(point.timestamp)}`,
          severity: 'error',
          icon: <Sun className="h-5 w-5 text-primary" />,
          timestamp: formatTime(point.timestamp),
          location: `${point.distance.toFixed(1)} km`,
          details: `High temperatures can lead to heat exhaustion or heat stroke. Stay hydrated and avoid extended exposure.`,
          pointIndex: index,
          value: `${Math.round(weather.temperature)}°C`,
        });
      }

      // Check for freezing conditions
      if (weather.temperature < 0) {
        newAlerts.push({
          id: `freezing-${index}`,
          type: 'freezing',
          title: 'Freezing Conditions',
          description: `Temperature of ${Math.round(weather.temperature)}°C expected at ${formatTime(point.timestamp)}`,
          severity: 'warning',
          icon: <Snowflake className="h-5 w-5 text-primary" />,
          timestamp: formatTime(point.timestamp),
          location: `${point.distance.toFixed(1)} km`,
          details: `Freezing conditions may lead to ice on roads or paths. Take extra caution and dress warmly.`,
          pointIndex: index,
          value: `${Math.round(weather.temperature)}°C`,
        });
      }

      // Check for high winds
      if (weather.windSpeed > 30) {
        const windSpeedInMS = weather.windSpeed / 3.6;
        newAlerts.push({
          id: `wind-${index}`,
          type: 'highWind',
          title: 'High Wind Alert',
          description: `Wind speeds of ${windSpeedInMS.toFixed(1)} m/s expected at ${formatTime(point.timestamp)}`,
          severity: 'warning',
          icon: <Wind className="h-5 w-5 text-primary" />,
          timestamp: formatTime(point.timestamp),
          location: `${point.distance.toFixed(1)} km`,
          details: `High winds can make cycling or outdoor activities difficult and potentially dangerous. Consider alternative routes or timing.`,
          pointIndex: index,
          value: `${windSpeedInMS.toFixed(1)} m/s`,
        });
      }

      // Check for heavy rain
      if (weather.precipitation > 0.5) {
        newAlerts.push({
          id: `rain-${index}`,
          type: 'heavyRain',
          title: 'Heavy Rain Expected',
          description: `${Math.round(weather.precipitation * 100)}% chance of precipitation at ${formatTime(point.timestamp)}`,
          severity: 'info',
          icon: <CloudRain className="h-5 w-5 text-primary" />,
          timestamp: formatTime(point.timestamp),
          location: `${point.distance.toFixed(1)} km`,
          details: `Heavy rain can reduce visibility and make surfaces slippery. Bring appropriate gear and consider shelter options.`,
          pointIndex: index,
          value: `${Math.round(weather.precipitation * 100)}%`,
        });
      }
    });

    // Sort alerts by severity and time
    newAlerts.sort((a, b) => {
      // First by severity (error > warning > info)
      const severityOrder = { error: 0, warning: 1, info: 2 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;

      // Then by time
      return forecastPoints[a.pointIndex].timestamp - forecastPoints[b.pointIndex].timestamp;
    });

    setAlerts(newAlerts);
  }, [forecastPoints, weatherData]);

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  // Determine which alerts to show based on showAll state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const displayedAlerts = showAll ? visibleAlerts : visibleAlerts.slice(0, maxInitialAlerts);

  // Handle alert dismissal
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDismiss = (id: string) => {
    setDismissedAlerts(prev => new Set([...prev, id]));
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  // Group alerts by type
  const alertsByType = visibleAlerts.reduce<Record<string, Alert[]>>(
    (acc, alert) => {
      if (!acc[alert.type]) {
        acc[alert.type] = [];
      }
      acc[alert.type].push(alert);
      return acc;
    },
    { extremeHeat: [], freezing: [], highWind: [], heavyRain: [] }
  );

  // Get alert type details
  const getAlertTypeDetails = (type: string) => {
    switch (type) {
      case 'extremeHeat':
        return {
          icon: <Sun className="h-4 w-4 text-primary" />,
          title: 'Extreme Heat',
          color: 'text-foreground',
          bgColor: 'bg-red-50 dark:bg-red-900/10',
          borderColor: 'border-red-100 dark:border-red-900/20',
        };
      case 'freezing':
        return {
          icon: <Snowflake className="h-4 w-4 text-primary" />,
          title: 'Freezing',
          color: 'text-foreground',
          bgColor: 'bg-blue-50 dark:bg-blue-900/10',
          borderColor: 'border-blue-100 dark:border-blue-900/20',
        };
      case 'highWind':
        return {
          icon: <Wind className="h-4 w-4 text-primary" />,
          title: 'High Wind',
          color: 'text-foreground',
          bgColor: 'bg-amber-50 dark:bg-amber-900/10',
          borderColor: 'border-amber-100 dark:border-amber-900/20',
        };
      case 'heavyRain':
        return {
          icon: <CloudRain className="h-4 w-4 text-primary" />,
          title: 'Heavy Rain',
          color: 'text-foreground',
          bgColor: 'bg-blue-50 dark:bg-blue-900/10',
          borderColor: 'border-blue-100 dark:border-blue-900/20',
        };
      default:
        return {
          icon: <AlertTriangle className="h-4 w-4 text-primary" />,
          title: 'Alert',
          color: 'text-foreground',
          bgColor: 'bg-zinc-50 dark:bg-zinc-900/10',
          borderColor: 'border-border',
        };
    }
  };

  // Render compact alerts for a specific type
  const renderCompactAlerts = (type: string) => {
    const typeAlerts = alertsByType[type as keyof typeof alertsByType] || [];
    if (typeAlerts.length === 0) return null;

    const { icon, title, color, bgColor, borderColor } = getAlertTypeDetails(type);

    return (
      <Card key={type} className={cn("overflow-hidden border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white/95 dark:bg-card stagger-item animate-fade-in", borderColor)}>
        <CardHeader className={cn("py-3 px-4", "border-b", borderColor)}>
          <CardTitle className={cn("text-sm font-medium flex items-center gap-2", color)}>
            <div className="p-1.5 bg-primary/10 rounded-full shadow-sm ring-1 ring-primary/5">
              {icon}
            </div>
            <span>
              {title} <span className="text-xs font-normal text-muted-foreground ml-1">({typeAlerts.length})</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {typeAlerts.map(alert => (
              <Badge
                key={alert.id}
                variant="outline"
                className={cn(
                  "flex items-center gap-1.5 py-1.5 px-2.5",
                  "text-xs hover:bg-muted/50 transition-all duration-200 hover:shadow-sm hover:scale-105"
                )}
                title={`${alert.timestamp} at ${alert.location}`}
              >
                <span className="font-semibold">{alert.value}</span>
                <span className="mx-0.5 text-muted-foreground">•</span>
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{alert.location.replace(' km', '')}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className={cn('p-5 border border-border bg-white/95 dark:bg-card rounded-lg shadow-sm text-foreground transition-all duration-300 backdrop-blur-[2px] card-hover-effect', className)}>
      <div className={cn("flex items-center justify-between pb-3 mb-4 border-b border-border")}>
        <h3 className={cn("text-base font-semibold flex items-center gap-2.5")}>
          <div className="p-1.5 bg-primary/10 rounded-full shadow-sm ring-1 ring-primary/5 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-primary" />
          </div>
          Weather Alerts
          <span className="text-xs font-medium px-2.5 py-0.5 bg-muted rounded-full shadow-sm">{visibleAlerts.length}</span>
        </h3>
      </div>

      <div className={cn("space-y-4")}>
        {renderCompactAlerts('highWind')}
        {renderCompactAlerts('extremeHeat')}
        {renderCompactAlerts('freezing')}
        {renderCompactAlerts('heavyRain')}
      </div>
    </div>
  );
}
