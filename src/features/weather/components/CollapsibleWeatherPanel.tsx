'use client';

import React, { useState } from 'react';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import {
  formatDateTime,
  formatDistance,
  formatTemperature,
  formatWind,
  formatPrecipitation,
} from '@/utils/formatUtils';
import { Thermometer, Droplets, Wind, Sun, CloudRain, Gauge, Clock, MapPin, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWeatherIconUrl } from '@/utils/formatUtils';
import { cn } from '@/lib/utils';
import { typography, animation, effects, layout } from '@/styles/tailwind-utils';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface CollapsibleWeatherPanelProps {
  point: ForecastPoint;
  weather: WeatherData;
  onClose: () => void;
  className?: string;
  defaultCollapsed?: boolean;
}

const CollapsibleWeatherPanel: React.FC<CollapsibleWeatherPanelProps> = ({
  point,
  weather,
  onClose,
  className,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const isMobile = useIsMobile();

  // Always show expanded on desktop
  const effectiveCollapsed = isMobile ? isCollapsed : false;

  return (
    <div className={cn(
      "bg-card border border-border rounded-lg shadow-lg transition-all duration-300",
      effectiveCollapsed ? "p-3 mb-2" : "p-4 mb-4",
      animation.fadeIn,
      effects.card,
      className
    )}>
      <div className={cn(layout.flexBetween, "mb-2")}>
        <div className={cn(layout.flexRow)}>
          <div className="mr-3">
            <img
              src={getWeatherIconUrl(weather.weatherIcon)}
              alt={weather.weatherDescription}
              className={cn("w-10 h-10", animation.fadeIn)}
            />
          </div>
          <div>
            <h3 className={cn(typography.h5)}>{formatDateTime(point.timestamp)}</h3>
            <p className={cn(typography.bodySm, typography.muted, layout.flexRow)}>
              <MapPin className="h-3.5 w-3.5 mr-1" />
              {formatDistance(point.distance)} from start
            </p>
          </div>
        </div>
        <div className={cn(layout.flexRow, "gap-1")}>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", effects.buttonHover)}
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={effectiveCollapsed ? "Expand weather details" : "Collapse weather details"}
            >
              {effectiveCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", effects.buttonHover)}
            onClick={onClose}
            aria-label="Close weather panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Collapsible content */}
      {!effectiveCollapsed && (
        <>
          <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4", animation.fadeIn)}>
            <div className={cn(effects.cardInner, "p-3")}>
              <div className={cn(layout.flexRow, "gap-2 mb-1")}>
                <Thermometer className="h-4 w-4 text-blue-500" />
                <span className={cn(typography.bodySm, typography.strong)}>Temperature</span>
              </div>
              <div className={cn(typography.bodyLg, "mb-1")}>
                {formatTemperature(weather.temperature)}
              </div>
              <div className={cn(typography.bodyXs, typography.muted)}>
                Feels like {formatTemperature(weather.feelsLike)}
              </div>
            </div>

            <div className={cn(effects.cardInner, "p-3")}>
              <div className={cn(layout.flexRow, "gap-2 mb-1")}>
                <Wind className="h-4 w-4 text-blue-500" />
                <span className={cn(typography.bodySm, typography.strong)}>Wind</span>
              </div>
              <div className={cn(typography.bodyLg, "mb-1")}>
                {formatWind(weather.windSpeed, weather.windDirection)}
              </div>
              <div className={cn(typography.bodyXs, typography.muted)}>
                Gusts up to {weather.windGust?.toFixed(1) || weather.windSpeed.toFixed(1)} m/s
              </div>
            </div>

            <div className={cn(effects.cardInner, "p-3")}>
              <div className={cn(layout.flexRow, "gap-2 mb-1")}>
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className={cn(typography.bodySm, typography.strong)}>Precipitation</span>
              </div>
              <div className={cn(typography.bodyLg, "mb-1")}>
                {formatPrecipitation(weather.rain || 0)}
              </div>
              <div className={cn(typography.bodyXs, typography.muted)}>
                Humidity {weather.humidity}%
              </div>
            </div>

            <div className={cn(effects.cardInner, "p-3")}>
              <div className={cn(layout.flexRow, "gap-2 mb-1")}>
                <Sun className="h-4 w-4 text-amber-500" />
                <span className={cn(typography.bodySm, typography.strong)}>UV Index</span>
              </div>
              <div className={cn(typography.bodyLg, "mb-1")}>
                {weather.uvIndex?.toFixed(1) || 'N/A'}
              </div>
              <div className={cn(typography.bodyXs, typography.muted)}>
                {weather.uvIndex && weather.uvIndex > 5 ? 'High' : 'Low'} exposure risk
              </div>
            </div>
          </div>

          <div className={cn("mt-4 pt-3", effects.borderTop)}>
            <div className={cn(typography.bodySm, typography.strong)}>{weather.weatherDescription}</div>
            <div className={cn(typography.bodyXs, typography.muted, "mt-1")}>
              {weather.rain > 0 ? `Expect ${formatPrecipitation(weather.rain)} of rain. ` : ''}
              {weather.snow > 0 ? `Expect ${formatPrecipitation(weather.snow)} of snow. ` : ''}
              {weather.windSpeed > 5 ? `Wind may be noticeable. ` : ''}
              {weather.uvIndex > 5 ? `High UV index, sun protection recommended. ` : ''}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CollapsibleWeatherPanel;
