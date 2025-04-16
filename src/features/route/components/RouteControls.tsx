'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Save, RefreshCw } from 'lucide-react';

/**
 * Props for the RouteControls component
 */
interface RouteControlsProps {
  /** Callback function when settings are updated */
  onUpdateSettings: (settings: RouteSettings) => void;
  /** Callback function when PDF export is requested */
  onExportPDF: () => void;
  /** Whether the forecast is currently being generated */
  isGenerating: boolean;
  /** Whether a PDF is currently being exported */
  isExporting: boolean;
}

/**
 * Settings for configuring a route
 */
export interface RouteSettings {
  /** Start time of the route */
  startTime: Date;
  /** Interval between weather forecast points in kilometers */
  weatherInterval: number;
  /** Average speed in kilometers per hour */
  avgSpeed: number;
}

/**
 * RouteControls component for configuring route settings
 * @param props - Component props
 * @returns React component
 */
export default function RouteControls({
  onUpdateSettings,
  onExportPDF,
  isGenerating,
  isExporting,
}: RouteControlsProps): React.ReactElement {
  /**
   * Get tomorrow at 8:00 AM for default start time
   * @returns Date object set to tomorrow at 8:00 AM
   */
  const getDefaultStartTime = (): Date => {
    const now: Date = new Date();
    const tomorrow: Date = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow;
  };

  const [startTime, setStartTime] = useState<Date>(getDefaultStartTime());
  const [weatherInterval, setWeatherInterval] = useState<number>(5);
  const [avgSpeed, setAvgSpeed] = useState<number>(20);

  /**
   * Convert date to string format for datetime-local input
   * @param date - Date to format
   * @returns Formatted date string in YYYY-MM-DDTHH:MM format
   */
  const formatDateForInput = (date: Date): string => {
    const year: number = date.getFullYear();
    const month: string = String(date.getMonth() + 1).padStart(2, '0');
    const day: string = String(date.getDate()).padStart(2, '0');
    const hours: string = String(date.getHours()).padStart(2, '0');
    const minutes: string = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  /**
   * Handle start time change from the datetime input
   * @param e - Input change event
   */
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newStartTime: Date = new Date(e.target.value);
    setStartTime(newStartTime);
  };

  /**
   * Generate forecast based on current settings
   */
  const handleGenerateForecast = (): void => {
    onUpdateSettings({
      startTime,
      weatherInterval,
      avgSpeed,
    });
  };

  /**
   * Format the interval value for display
   * @param value - Interval value in kilometers
   * @returns Formatted string with units
   */
  const formatIntervalValue = (value: number): string => `${value} km`;

  /**
   * Format the speed value for display
   * @param value - Speed value in km/h
   * @returns Formatted string with units
   */
  const formatSpeedValue = (value: number): string => `${value} km/h`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formatDateForInput(startTime)}
              onChange={handleStartTimeChange}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="weatherInterval">Weather Interval</Label>
              <span className="text-sm text-muted-foreground">
                {formatIntervalValue(weatherInterval)}
              </span>
            </div>
            <Slider
              id="weatherInterval"
              min={1}
              max={20}
              step={1}
              value={[weatherInterval]}
              onValueChange={value => setWeatherInterval(value[0])}
              className="py-4"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="avgSpeed">Average Speed</Label>
              <span className="text-sm text-muted-foreground">{formatSpeedValue(avgSpeed)}</span>
            </div>
            <Slider
              id="avgSpeed"
              min={5}
              max={50}
              step={1}
              value={[avgSpeed]}
              onValueChange={value => setAvgSpeed(value[0])}
              className="py-4"
            />
          </div>

          <div className="flex items-center justify-between gap-3 mt-6">
            <Button
              onClick={handleGenerateForecast}
              disabled={isGenerating}
              className="flex-1 h-10"
              size="default"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Forecast'
              )}
            </Button>

            <Button
              onClick={onExportPDF}
              disabled={isExporting || isGenerating}
              variant="outline"
              className="h-10 px-4"
              size="default"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
