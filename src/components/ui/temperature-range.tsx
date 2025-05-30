'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TemperaturePoint {
  time: string;
  temperature: number;
  location?: string;
  feelsLike?: number;
}

interface TemperatureRangeProps {
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Minimum temperature */
  minTemp: number;
  /** Maximum temperature */
  maxTemp: number;
  /** Current temperature */
  currentTemp?: number;
  /** Temperature unit */
  unit?: '°C' | '°F';
  /** Temperature points along the route */
  points?: TemperaturePoint[];
  /** Optional className for styling */
  className?: string;
  /** Whether to add a border to the card */
  bordered?: boolean;
  /** Whether to add a shadow to the card */
  shadowed?: boolean;
  /** Whether to add a rounded corner to the card */
  rounded?: boolean;
  /** Whether to add a background color to the card */
  background?: boolean;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to show a loading state */
  loading?: boolean;
  /** Whether to show the temperature gradient */
  showGradient?: boolean;
  /** Whether to show temperature points */
  showPoints?: boolean;
  /** Whether to show labels */
  showLabels?: boolean;
  /** Whether to show the current temperature */
  showCurrent?: boolean;
}

/**
 * A temperature range visualization component that follows iOS 19 design principles
 */
export function TemperatureRange({
  title = 'Temperature Range',
  description,
  minTemp,
  maxTemp,
  currentTemp,
  unit = '°C',
  points = [],
  className,
  bordered = true,
  shadowed = true,
  rounded = true,
  background = true,
  glass = false,
  loading = false,
  showGradient = true,
  showPoints = true,
  showLabels = true,
  showCurrent = true,
}: TemperatureRangeProps) {
  // Calculate the position of a temperature on the range (0-100%)
  const getPositionPercent = (temp: number) => {
    const range = maxTemp - minTemp;
    if (range === 0) return 50; // Avoid division by zero
    
    const position = ((temp - minTemp) / range) * 100;
    return Math.max(0, Math.min(100, position)); // Clamp between 0-100%
  };
  
  // Get color for temperature
  const getTempColor = (temp: number) => {
    if (temp <= 0) return 'rgb(59, 130, 246)'; // Blue
    if (temp <= 10) return 'rgb(14, 165, 233)'; // Sky blue
    if (temp <= 20) return 'rgb(34, 197, 94)'; // Green
    if (temp <= 30) return 'rgb(245, 158, 11)'; // Amber
    return 'rgb(239, 68, 68)'; // Red
  };
  
  return (
    <Card
      className={cn('overflow-hidden', className)}
      variant={background ? (glass ? 'glass' : 'default') : 'ghost'}
      hover="none"
      rounded={rounded ? 'lg' : 'none'}
      glass={glass}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      
      <CardContent>
        {loading ? (
          <div className="w-full flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Temperature range bar */}
            <div className="relative h-8 rounded-full overflow-hidden">
              {/* Background gradient */}
              {showGradient && (
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to right, 
                      rgb(59, 130, 246), 
                      rgb(14, 165, 233), 
                      rgb(34, 197, 94), 
                      rgb(245, 158, 11), 
                      rgb(239, 68, 68))`
                  }}
                />
              )}
              
              {/* Min and max labels */}
              {showLabels && (
                <>
                  <div className="absolute bottom-full left-0 mb-1 text-xs font-medium">
                    {minTemp}{unit}
                  </div>
                  <div className="absolute bottom-full right-0 mb-1 text-xs font-medium">
                    {maxTemp}{unit}
                  </div>
                </>
              )}
              
              {/* Current temperature indicator */}
              {showCurrent && currentTemp !== undefined && (
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-md z-10"
                  style={{ 
                    left: `calc(${getPositionPercent(currentTemp)}% - 2px)`,
                  }}
                />
              )}
              
              {/* Temperature points */}
              {showPoints && points.map((point, index) => (
                <div
                  key={index}
                  className="absolute top-0 w-2 h-2 rounded-full bg-white shadow-sm z-5"
                  style={{ 
                    left: `calc(${getPositionPercent(point.temperature)}% - 4px)`,
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                  title={`${point.time}: ${point.temperature}${unit}${point.location ? ` at ${point.location}` : ''}`}
                />
              ))}
            </div>
            
            {/* Temperature points list */}
            {showPoints && points.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {points.map((point, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex flex-col">
                      <span className="font-medium">{point.time}</span>
                      {point.location && (
                        <span className="text-xs text-muted-foreground">{point.location}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span 
                        className="font-semibold"
                        style={{ color: getTempColor(point.temperature) }}
                      >
                        {point.temperature}{unit}
                      </span>
                      {point.feelsLike !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          Feels: {point.feelsLike}{unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TemperatureRange;
