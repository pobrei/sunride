'use client';

import React from 'react';
import { ForecastPoint, WeatherData } from '@/lib/weatherAPI';
import { formatDateTime, formatDistance, formatTemperature, formatWind, formatPrecipitation } from '@/utils/helpers';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  CloudRain, 
  Gauge, 
  Clock, 
  MapPin,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWeatherIconUrl } from '@/utils/helpers';

interface WeatherInfoPanelProps {
  point: ForecastPoint;
  weather: WeatherData;
  onClose: () => void;
}

const WeatherInfoPanel: React.FC<WeatherInfoPanelProps> = ({ point, weather, onClose }) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-4 mb-4 animate-fade-in">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="mr-3">
            <img 
              src={getWeatherIconUrl(weather.weatherIcon)} 
              alt={weather.weatherDescription} 
              className="w-12 h-12"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{formatDateTime(point.timestamp)}</h3>
            <p className="text-muted-foreground text-sm flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              {formatDistance(point.distance)} from start
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        <div className="flex items-center">
          <Thermometer className="h-4 w-4 mr-2 text-red-500" />
          <div>
            <div className="text-sm font-medium">{formatTemperature(weather.temperature)}</div>
            <div className="text-xs text-muted-foreground">Temperature</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Thermometer className="h-4 w-4 mr-2 text-orange-400" />
          <div>
            <div className="text-sm font-medium">{formatTemperature(weather.feelsLike)}</div>
            <div className="text-xs text-muted-foreground">Feels Like</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Wind className="h-4 w-4 mr-2 text-blue-400" />
          <div>
            <div className="text-sm font-medium">{formatWind(weather.windSpeed, weather.windDirection)}</div>
            <div className="text-xs text-muted-foreground">Wind</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Droplets className="h-4 w-4 mr-2 text-blue-500" />
          <div>
            <div className="text-sm font-medium">{weather.humidity}%</div>
            <div className="text-xs text-muted-foreground">Humidity</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <CloudRain className="h-4 w-4 mr-2 text-blue-300" />
          <div>
            <div className="text-sm font-medium">{formatPrecipitation(weather.rain)}</div>
            <div className="text-xs text-muted-foreground">Precipitation</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Sun className="h-4 w-4 mr-2 text-yellow-500" />
          <div>
            <div className="text-sm font-medium">{weather.uvIndex}</div>
            <div className="text-xs text-muted-foreground">UV Index</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Gauge className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <div className="text-sm font-medium">{weather.pressure} hPa</div>
            <div className="text-xs text-muted-foreground">Pressure</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <div className="text-sm font-medium">{new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
        </div>
        
        <div className="flex items-center col-span-1 md:col-span-1">
          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <div className="text-sm font-medium">{point.lat.toFixed(5)}, {point.lon.toFixed(5)}</div>
            <div className="text-xs text-muted-foreground">Coordinates</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-border">
        <div className="text-sm font-medium">{weather.weatherDescription}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {weather.rain > 0 ? `Expect ${formatPrecipitation(weather.rain)} of rain. ` : ''}
          {weather.snow > 0 ? `Expect ${formatPrecipitation(weather.snow)} of snow. ` : ''}
          {weather.windSpeed > 5 ? `Wind may be noticeable. ` : ''}
          {weather.uvIndex > 5 ? `High UV index, sun protection recommended. ` : ''}
        </div>
      </div>
    </div>
  );
};

export default WeatherInfoPanel;
