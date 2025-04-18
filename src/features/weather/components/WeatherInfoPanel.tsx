'use client';

import React from 'react';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import {
  formatDateTime,
  formatDistance,
  formatTemperature,
  formatWind,
  formatPrecipitation,
} from '@/utils/formatUtils';
import { Thermometer, Droplets, Wind, Sun, CloudRain, Gauge, Clock, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWeatherIconUrl } from '@/utils/formatUtils';
import { cn } from '@/lib/utils';
import { typography, animation, effects, layout } from '@/styles/tailwind-utils';

interface WeatherInfoPanelProps {
  point: ForecastPoint;
  weather: WeatherData;
  onClose: () => void;
}

const WeatherInfoPanel: React.FC<WeatherInfoPanelProps> = ({ point, weather, onClose }) => {
  return (
    <div className={cn(
      "bg-card border border-border rounded-lg shadow-lg p-4 mb-8",
      animation.fadeIn,
      effects.card
    )}>
      <div className={cn(layout.flexBetween, "mb-4")}>
        <div className={cn(layout.flexRow)}>
          <div className="mr-4">
            <img
              src={getWeatherIconUrl(weather.weatherIcon)}
              alt={weather.weatherDescription}
              className={cn("w-12 h-12", animation.fadeIn)}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{formatDateTime(point.timestamp)}</h3>
            <p className={cn("text-sm font-medium text-zinc-500", layout.flexRow)}>
              <MapPin className="h-3.5 w-3.5 mr-1" />
              {formatDistance(point.distance)} from start
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={cn("h-8 w-8", effects.buttonHover)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className={cn(layout.gridSm, "md:grid-cols-3 gap-4 mt-4")}>
        <div className={cn(layout.flexRow, effects.cardInner)}>
          <Thermometer className="h-4 w-4 mr-2 text-red-500" />
          <div>
            <div className="text-sm font-semibold">{formatTemperature(weather.temperature)}</div>
            <div className="text-xs font-medium text-zinc-500">Temperature</div>
          </div>
        </div>

        <div className={cn(layout.flexRow, effects.cardInner)}>
          <Thermometer className="h-4 w-4 mr-2 text-orange-400" />
          <div>
            <div className="text-sm font-semibold">{formatTemperature(weather.feelsLike)}</div>
            <div className="text-xs font-medium text-zinc-500">Feels Like</div>
          </div>
        </div>

        <div className={cn(layout.flexRow, effects.cardInner)}>
          <Wind className="h-4 w-4 mr-2 text-blue-400" />
          <div>
            <div className="text-sm font-semibold">
              {formatWind(weather.windSpeed, weather.windDirection)}
            </div>
            <div className="text-xs font-medium text-zinc-500">Wind</div>
          </div>
        </div>

        <div className={cn(layout.flexRow, effects.cardInner)}>
          <Droplets className="h-4 w-4 mr-2 text-blue-500" />
          <div>
            <div className="text-sm font-semibold">{weather.humidity}%</div>
            <div className="text-xs font-medium text-zinc-500">Humidity</div>
          </div>
        </div>

        <div className={cn(layout.flexRow, effects.cardInner)}>
          <CloudRain className="h-4 w-4 mr-2 text-blue-300" />
          <div>
            <div className="text-sm font-semibold">{formatPrecipitation(weather.rain)}</div>
            <div className="text-xs font-medium text-zinc-500">Precipitation</div>
          </div>
        </div>

        <div className={cn(layout.flexRow, effects.cardInner)}>
          <Sun className="h-4 w-4 mr-2 text-yellow-500" />
          <div>
            <div className="text-sm font-semibold">{weather.uvIndex !== undefined ? weather.uvIndex.toFixed(1) : 'N/A'}</div>
            <div className="text-xs font-medium text-zinc-500">UV Index</div>
          </div>
        </div>

        <div className={cn(layout.flexRow, effects.cardInner)}>
          <Gauge className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <div className="text-sm font-semibold">{weather.pressure} hPa</div>
            <div className="text-xs font-medium text-zinc-500">Pressure</div>
          </div>
        </div>

        <div className={cn(layout.flexRow, effects.cardInner)}>
          <Clock className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <div className="text-sm font-semibold">
              {new Date(point.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className="text-xs font-medium text-zinc-500">Time</div>
          </div>
        </div>

        <div className={cn(layout.flexRow, effects.cardInner, "col-span-1 md:col-span-1")}>
          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <div className="text-sm font-semibold">
              {point.lat.toFixed(5)}, {point.lon.toFixed(5)}
            </div>
            <div className="text-xs font-medium text-zinc-500">Coordinates</div>
          </div>
        </div>
      </div>

      <div className={cn("mt-8 pt-4", effects.borderTop)}>
        <div className="text-sm font-semibold">{weather.weatherDescription}</div>
        <div className="text-xs font-medium text-zinc-500 mt-2">
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
