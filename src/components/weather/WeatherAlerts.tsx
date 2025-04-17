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
          icon: <Sun className="h-3 w-3 text-red-500" />,
          title: 'Extreme Heat',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'freezing':
        return {
          icon: <Snowflake className="h-3 w-3 text-blue-500" />,
          title: 'Freezing',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'highWind':
        return {
          icon: <Wind className="h-3 w-3 text-amber-500" />,
          title: 'High Wind',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        };
      case 'heavyRain':
        return {
          icon: <CloudRain className="h-3 w-3 text-cyan-500" />,
          title: 'Heavy Rain',
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50',
          borderColor: 'border-cyan-200',
        };
      default:
        return {
          icon: <AlertTriangle className="h-3 w-3 text-gray-500" />,
          title: 'Alert',
          color: 'text-gray-600',
          bgColor: 'bg-zinc-50',
          borderColor: 'border-zinc-200',
        };
    }
  };

  // Render compact alerts for a specific type
  const renderCompactAlerts = (type: string) => {
    const typeAlerts = alertsByType[type as keyof typeof alertsByType] || [];
    if (typeAlerts.length === 0) return null;

    const { icon, title, color, bgColor, borderColor } = getAlertTypeDetails(type);

    return (
      <Card key={type} className={cn("overflow-hidden border text-zinc-800 dark:text-zinc-200 shadow-sm", borderColor, animation.fadeIn)}>
        <CardHeader className={cn("py-1 px-2", bgColor, "border-b", borderColor)}>
          <CardTitle className={cn("text-[10px] font-medium flex items-center", color)}>
            {icon}
            <span className="ml-1">
              {title} ({typeAlerts.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-1.5">
          <div className="flex flex-wrap gap-0.5">
            {typeAlerts.map(alert => (
              <Badge
                key={alert.id}
                variant="outline"
                className={cn(
                  "flex items-center gap-0.5 py-0.5 px-1.5",
                  bgColor,
                  "hover:bg-opacity-20 transition-colors text-[10px]"
                )}
                title={`${alert.timestamp} at ${alert.location}`}
              >
                <span className="font-semibold">{alert.value}</span>
                <span className="mx-0.5">•</span>
                <MapPin className="h-2 w-2" />
                {alert.location.replace(' km', '')}
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
    <div className={cn('p-2 border border-zinc-100 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm', animation.fadeIn, className)}>
      <div className={cn(layout.flexBetween, "pb-1 mb-1 border-b border-zinc-100 dark:border-zinc-700")}>
        <h3 className={cn("text-xs font-semibold", layout.flexRow, "gap-1")}>
          <AlertTriangle className="h-3.5 w-3.5 text-primary" />
          Weather Alerts
          <span className="text-xs font-medium text-zinc-500">({visibleAlerts.length})</span>
        </h3>
      </div>

      <div className={cn("space-y-1", animation.fadeInSlideUp)}>
        {renderCompactAlerts('highWind')}
        {renderCompactAlerts('extremeHeat')}
        {renderCompactAlerts('freezing')}
        {renderCompactAlerts('heavyRain')}
      </div>
    </div>
  );
}
