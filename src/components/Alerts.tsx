'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { checkWeatherAlerts, formatTime, formatDistance } from '@/utils/helpers';
import { AlertTriangle, Thermometer, Wind, Droplets, AlertCircle } from 'lucide-react';
import gsap from 'gsap';

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

export default function Alerts({ forecastPoints, weatherData }: AlertsProps) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);

  // Process weather data to generate alerts
  useEffect(() => {
    if (forecastPoints.length === 0 || weatherData.length === 0) {
      setAlerts([]);
      return;
    }

    const newAlerts: WeatherAlert[] = [];

    forecastPoints.forEach((point, index) => {
      const weather = weatherData[index];
      if (!weather) return;

      const alertConditions = checkWeatherAlerts(weather);
      
      if (alertConditions.extremeHeat) {
        newAlerts.push({
          id: `heat-${index}`,
          type: 'extremeHeat',
          point,
          weather
        });
      }
      
      if (alertConditions.freezing) {
        newAlerts.push({
          id: `freezing-${index}`,
          type: 'freezing',
          point,
          weather
        });
      }
      
      if (alertConditions.highWind) {
        newAlerts.push({
          id: `wind-${index}`,
          type: 'highWind',
          point,
          weather
        });
      }
      
      if (alertConditions.heavyRain) {
        newAlerts.push({
          id: `rain-${index}`,
          type: 'heavyRain',
          point,
          weather
        });
      }
    });

    setAlerts(newAlerts);
  }, [forecastPoints, weatherData]);

  // Animate alerts on mount
  useEffect(() => {
    if (alerts.length > 0) {
      gsap.fromTo(
        '.weather-alert',
        { x: -20, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          stagger: 0.1, 
          duration: 0.4, 
          ease: 'back.out(1.2)',
          overwrite: true
        }
      );
    }
  }, [alerts]);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mt-4">
      <h2 className="text-lg font-semibold">Weather Alerts</h2>
      
      <div className="space-y-2">
        {alerts.map(alert => {
          const { id, type, point, weather } = alert;
          
          let icon, title, variant, description;
          
          switch (type) {
            case 'extremeHeat':
              icon = <Thermometer className="h-5 w-5 text-red-500" />;
              title = 'Extreme Heat';
              variant = 'destructive';
              description = `Temperature of ${Math.round(weather.temperature)}°C at ${formatTime(point.timestamp)} (${formatDistance(point.distance)})`;
              break;
            case 'freezing':
              icon = <Thermometer className="h-5 w-5 text-blue-500" />;
              title = 'Freezing Temperature';
              variant = 'default';
              description = `Temperature of ${Math.round(weather.temperature)}°C at ${formatTime(point.timestamp)} (${formatDistance(point.distance)})`;
              break;
            case 'highWind':
              icon = <Wind className="h-5 w-5 text-amber-500" />;
              title = 'High Wind';
              variant = 'default';
              description = `Wind speed of ${weather.windSpeed.toFixed(1)} m/s at ${formatTime(point.timestamp)} (${formatDistance(point.distance)})`;
              break;
            case 'heavyRain':
              icon = <Droplets className="h-5 w-5 text-purple-500" />;
              title = 'Heavy Rain';
              variant = 'default';
              description = `Precipitation of ${weather.rain.toFixed(1)} mm at ${formatTime(point.timestamp)} (${formatDistance(point.distance)})`;
              break;
            default:
              icon = <AlertCircle className="h-5 w-5" />;
              title = 'Weather Alert';
              variant = 'default';
              description = `Alert at ${formatTime(point.timestamp)} (${formatDistance(point.distance)})`;
          }
          
          return (
            <Alert 
              key={id} 
              variant={variant as any}
              className="weather-alert bg-[#1c1c1e] border-neutral-800"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertTitle className="flex items-center font-medium">
                {icon}
                <span className="ml-2">{title}</span>
              </AlertTitle>
              <AlertDescription className="ml-7 text-sm text-neutral-300">
                {description}
              </AlertDescription>
            </Alert>
          );
        })}
      </div>
    </div>
  );
} 