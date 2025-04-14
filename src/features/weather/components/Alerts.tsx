'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Thermometer, Wind, Droplets, AlertCircle, Clock, MapPin } from 'lucide-react';
import gsap from 'gsap';

// Import from features
import { ForecastPoint, WeatherData } from '@/features/weather/types';

// Import from components
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/badge';

// Import from utils
import { checkWeatherAlerts, formatTime, formatDistance } from '@/utils/formatUtils';

interface AlertsProps {
  forecastPoints: ForecastPoint[];
  weatherData: (WeatherData | null)[];
}

interface WeatherAlert {
  id: string;
  type: 'extremeHeat' | 'freezing' | 'highWind' | 'heavyRain';
  point: ForecastPoint;
  weather: WeatherData;
}

/**
 * Component to display weather alerts
 * @param props - Component props
 * @returns React component
 */
export default function Alerts({ forecastPoints, weatherData }: AlertsProps): React.ReactElement {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [alertsByType, setAlertsByType] = useState<Record<string, WeatherAlert[]>>({
    extremeHeat: [],
    freezing: [],
    highWind: [],
    heavyRain: []
  });

  // Process weather data to generate alerts
  useEffect(() => {
    if (forecastPoints.length === 0 || weatherData.length === 0) {
      setAlerts([]);
      setAlertsByType({
        extremeHeat: [],
        freezing: [],
        highWind: [],
        heavyRain: []
      });
      return;
    }

    const newAlerts: WeatherAlert[] = [];
    const newAlertsByType: Record<string, WeatherAlert[]> = {
      extremeHeat: [],
      freezing: [],
      highWind: [],
      heavyRain: []
    };

    forecastPoints.forEach((point, index) => {
      const weather: WeatherData | null = weatherData[index];
      if (!weather) return;

      const alertConditions: ReturnType<typeof checkWeatherAlerts> = checkWeatherAlerts(weather);

      if (alertConditions.extremeHeat) {
        const alert: WeatherAlert = {
          id: `heat-${index}`,
          type: 'extremeHeat' as const,
          point,
          weather
        };
        newAlerts.push(alert);
        newAlertsByType.extremeHeat.push(alert);
      }

      if (alertConditions.freezing) {
        const alert: WeatherAlert = {
          id: `freezing-${index}`,
          type: 'freezing' as const,
          point,
          weather
        };
        newAlerts.push(alert);
        newAlertsByType.freezing.push(alert);
      }

      if (alertConditions.highWind) {
        const alert: WeatherAlert = {
          id: `wind-${index}`,
          type: 'highWind' as const,
          point,
          weather
        };
        newAlerts.push(alert);
        newAlertsByType.highWind.push(alert);
      }

      if (alertConditions.heavyRain) {
        const alert: WeatherAlert = {
          id: `rain-${index}`,
          type: 'heavyRain' as const,
          point,
          weather
        };
        newAlerts.push(alert);
        newAlertsByType.heavyRain.push(alert);
      }
    });

    setAlerts(newAlerts);
    setAlertsByType(newAlertsByType);
  }, [forecastPoints, weatherData]);

  // Animate alerts on mount
  useEffect(() => {
    if (alerts.length > 0) {
      // Wait for DOM to be updated
      setTimeout(() => {
        const alertElements = document.querySelectorAll('.weather-alert');
        if (alertElements.length > 0) {
          gsap.fromTo(
            '.weather-alert',
            { y: 10, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.1,
              duration: 0.4,
              ease: 'back.out(1.2)',
              overwrite: true
            }
          );
        }
      }, 0);
    }
  }, [alerts]);

  if (alerts.length === 0) {
    return null;
  }

  /**
   * Get alert type details for styling and display
   * @param type - Alert type
   * @returns Object with styling and display properties
   */
  const getAlertTypeDetails = (type: string): {
    icon: React.ReactNode;
    title: string;
    color: string;
    bgColor: string;
    borderColor: string;
  } => {
    switch (type) {
      case 'extremeHeat':
        return {
          icon: <Thermometer className="h-5 w-5" />,
          title: 'Extreme Heat',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-l-destructive'
        };
      case 'freezing':
        return {
          icon: <Thermometer className="h-5 w-5" />,
          title: 'Freezing Temperature',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          borderColor: 'border-l-primary'
        };
      case 'highWind':
        return {
          icon: <Wind className="h-5 w-5" />,
          title: 'High Wind',
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-l-amber-500'
        };
      case 'heavyRain':
        return {
          icon: <Droplets className="h-5 w-5" />,
          title: 'Heavy Rain',
          color: 'text-secondary',
          bgColor: 'bg-secondary/10',
          borderColor: 'border-l-secondary'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          title: 'Weather Alert',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          borderColor: 'border-l-primary'
        };
    }
  };



  /**
   * Render compact alerts for a specific type
   * @param type - Alert type
   * @returns React element with compact alerts for the specified type
   */
  const renderCompactAlerts = (type: string): React.ReactElement | null => {
    const typeAlerts: WeatherAlert[] = alertsByType[type as keyof typeof alertsByType];
    if (typeAlerts.length === 0) return null;

    const { icon, title, color, bgColor }: ReturnType<typeof getAlertTypeDetails> = getAlertTypeDetails(type);

    return (
      <Card className="weather-alert overflow-hidden">
        <CardHeader className={`py-2 px-3 ${bgColor} border-b`}>
          <CardTitle className={`text-base font-semibold flex items-center ${color}`}>
            {icon}
            <span className="ml-2">{title} Alerts ({typeAlerts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-1.5">
            {typeAlerts.map(alert => (
              <Badge
                key={alert.id}
                variant="outline"
                className={`flex items-center gap-1 py-1 px-2 ${bgColor} hover:bg-opacity-20 transition-colors text-xs`}
              >
                <Clock className="h-3 w-3" />
                {formatTime(alert.point.timestamp)}
                <span className="mx-0.5">•</span>
                <span className="font-semibold">
                  {type === 'extremeHeat' && `${Math.round(alert.weather.temperature)}°C`}
                  {type === 'freezing' && `${Math.round(alert.weather.temperature)}°C`}
                  {type === 'highWind' && `${alert.weather.windSpeed.toFixed(1)} m/s`}
                  {type === 'heavyRain' && `${alert.weather.rain.toFixed(1)}mm`}
                </span>
                <span className="mx-0.5">•</span>
                {formatDistance(alert.point.distance)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-2 mt-4 animate-slide-up">
      <h2 className="text-lg font-semibold flex items-center">
        <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
        Weather Alerts
      </h2>

      <div className="space-y-2">
        {/* Compact Alerts for all types */}
        {renderCompactAlerts('highWind')}
        {renderCompactAlerts('extremeHeat')}
        {renderCompactAlerts('freezing')}
        {renderCompactAlerts('heavyRain')}
      </div>
    </div>
  );
}
