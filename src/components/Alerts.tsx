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
      // Wait for DOM to be updated
      setTimeout(() => {
        const alertElements = document.querySelectorAll('.weather-alert');
        if (alertElements.length > 0) {
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
      }, 0);
    }
  }, [alerts]);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mt-4 animate-slide-up">
      <h2 className="text-lg font-semibold flex items-center">
        <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
        Weather Alerts
      </h2>
      
      <div className="space-y-3">
        {alerts.map(alert => {
          const { id, type, point, weather } = alert;
          
          let icon, title, color, description;
          
          switch (type) {
            case 'extremeHeat':
              icon = <Thermometer className="h-5 w-5" />;
              title = 'Extreme Heat';
              color = 'text-destructive';
              description = `Temperature of ${Math.round(weather.temperature)}°C at ${formatTime(point.timestamp)} (${formatDistance(point.distance)})`;
              break;
            case 'freezing':
              icon = <Thermometer className="h-5 w-5" />;
              title = 'Freezing Temperature';
              color = 'text-primary';
              description = `Temperature of ${Math.round(weather.temperature)}°C at ${formatTime(point.timestamp)} (${formatDistance(point.distance)})`;
              break;
            case 'highWind':
              icon = <Wind className="h-5 w-5" />;
              title = 'High Wind';
              color = 'text-amber-500';
              description = `Wind speed of ${weather.windSpeed.toFixed(1)} m/s at ${formatTime(point.timestamp)} (${formatDistance(point.distance)})`;
              break;
            case 'heavyRain':
              icon = <Droplets className="h-5 w-5" />;
              title = 'Heavy Rain';
              color = 'text-secondary';
              description = `Precipitation of ${weather.rain.toFixed(1)} mm at ${formatTime(point.timestamp)} (${formatDistance(point.distance)})`;
              break;
            default:
              icon = <AlertCircle className="h-5 w-5" />;
              title = 'Weather Alert';
              color = 'text-primary';
              description = `Alert at ${formatTime(point.timestamp)} (${formatDistance(point.distance)})`;
          }
          
          return (
            <Alert 
              key={id}
              className={`weather-alert border-l-4 micro-shadow hover-lift transition-smooth ${
                type === 'extremeHeat' ? 'border-l-destructive' :
                type === 'freezing' ? 'border-l-primary' :
                type === 'highWind' ? 'border-l-amber-500' :
                type === 'heavyRain' ? 'border-l-secondary' :
                'border-l-primary'
              }`}
            >
              <AlertTitle className={`flex items-center font-medium ${color}`}>
                {icon}
                <span className="ml-2">{title}</span>
              </AlertTitle>
              <AlertDescription className="ml-7 text-sm text-muted-foreground">
                {description}
              </AlertDescription>
            </Alert>
          );
        })}
      </div>
    </div>
  );
} 