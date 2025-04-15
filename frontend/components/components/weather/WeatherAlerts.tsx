'use client';

import React, { useState, useEffect } from 'react';
import { ForecastPoint, WeatherData } from '@shared/types';
import { AlertCard } from '@frontend/components/ui/alert-card';
import { Button } from '@frontend/components/ui/button';
import { Thermometer, Wind, CloudRain, Snowflake, Sun, AlertTriangle } from 'lucide-react';
import { formatTime, formatDate } from '@shared/utils/formatters';
import { cn } from '@shared/lib/utils';
import { typography, animation, effects, layout } from '@shared/styles/tailwind-utils';

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
  title: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  icon: React.ReactNode;
  timestamp: string;
  location: string;
  details: string;
  pointIndex: number;
}

/**
 * A component that displays weather alerts for the route
 */
export function WeatherAlerts({
  forecastPoints,
  weatherData,
  className,
  maxInitialAlerts = 3,
  compact = true,
}: WeatherAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
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
          title: 'Extreme Heat Warning',
          description: `Temperature of ${Math.round(weather.temperature)}°C expected at ${formatTime(point.timestamp)}`,
          severity: 'error',
          icon: <Sun className="h-5 w-5 text-primary" />,
          timestamp: formatTime(point.timestamp),
          location: `${point.distance.toFixed(1)} km`,
          details: `High temperatures can lead to heat exhaustion or heat stroke. Stay hydrated and avoid extended exposure.`,
          pointIndex: index,
        });
      }

      // Check for freezing conditions
      if (weather.temperature < 0) {
        newAlerts.push({
          id: `freezing-${index}`,
          title: 'Freezing Conditions',
          description: `Temperature of ${Math.round(weather.temperature)}°C expected at ${formatTime(point.timestamp)}`,
          severity: 'warning',
          icon: <Snowflake className="h-5 w-5 text-primary" />,
          timestamp: formatTime(point.timestamp),
          location: `${point.distance.toFixed(1)} km`,
          details: `Freezing conditions may lead to ice on roads or paths. Take extra caution and dress warmly.`,
          pointIndex: index,
        });
      }

      // Check for high winds
      if (weather.windSpeed > 30) {
        newAlerts.push({
          id: `wind-${index}`,
          title: 'High Wind Alert',
          description: `Wind speeds of ${Math.round(weather.windSpeed)} km/h expected at ${formatTime(point.timestamp)}`,
          severity: 'warning',
          icon: <Wind className="h-5 w-5 text-primary" />,
          timestamp: formatTime(point.timestamp),
          location: `${point.distance.toFixed(1)} km`,
          details: `High winds can make cycling or outdoor activities difficult and potentially dangerous. Consider alternative routes or timing.`,
          pointIndex: index,
        });
      }

      // Check for heavy rain
      if (weather.precipitation > 0.5) {
        newAlerts.push({
          id: `rain-${index}`,
          title: 'Heavy Rain Expected',
          description: `${Math.round(weather.precipitation * 100)}% chance of precipitation at ${formatTime(point.timestamp)}`,
          severity: 'info',
          icon: <CloudRain className="h-5 w-5 text-primary" />,
          timestamp: formatTime(point.timestamp),
          location: `${point.distance.toFixed(1)} km`,
          details: `Heavy rain can reduce visibility and make surfaces slippery. Bring appropriate gear and consider shelter options.`,
          pointIndex: index,
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
  const displayedAlerts = showAll ? visibleAlerts : visibleAlerts.slice(0, maxInitialAlerts);

  // Handle alert dismissal
  const handleDismiss = (id: string) => {
    setDismissedAlerts(prev => new Set([...prev, id]));
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3 p-4 border border-primary/10 rounded-lg bg-gradient-to-r from-primary/5 to-transparent', animation.fadeIn, className)}>
      <div className={cn(layout.flexBetween)}>
        <h3 className={cn(typography.h5, layout.flexRow, "gap-2")}>
          <AlertTriangle className="h-5 w-5 text-primary" />
          Weather Alerts
          <span className={cn(typography.bodySm, typography.muted)}>({visibleAlerts.length})</span>
        </h3>
        {visibleAlerts.length > maxInitialAlerts && (
          <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)} className={effects.buttonHover}>
            {showAll ? 'Show Less' : `Show All (${visibleAlerts.length})`}
          </Button>
        )}
      </div>

      <div className={cn("space-y-3", animation.fadeInSlideUp)}>
        {displayedAlerts.map(alert => (
          <AlertCard
            key={alert.id}
            title={alert.title}
            description={alert.description}
            severity={alert.severity}
            icon={alert.icon}
            timestamp={alert.timestamp}
            location={alert.location}
            details={alert.details}
            dismissible={true}
            onDismiss={() => handleDismiss(alert.id)}
            className={compact ? 'p-3' : ''}
          />
        ))}
      </div>

      {!showAll && visibleAlerts.length > maxInitialAlerts && (
        <Button variant="outline" size="sm" className={cn("w-full", effects.buttonHover)} onClick={() => setShowAll(true)}>
          Show {visibleAlerts.length - maxInitialAlerts} More Alerts
        </Button>
      )}
    </div>
  );
}
