'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RefreshCw, Clock, Cloud, Gauge } from 'lucide-react';

/**
 * Props for the RouteControls component
 */
interface RouteControlsProps {
  onUpdateSettings?: (settings: {
    startTime: Date;
    weatherInterval: number;
    avgSpeed: number;
  }) => void;
  onGenerateForecast?: (startTime: Date, weatherInterval: number, avgSpeed: number) => void;
  isGenerating?: boolean;
}

/**
 * A component for controlling route settings
 */
export default function SimpleRouteControls({
  onUpdateSettings,
  onGenerateForecast,
  isGenerating = false,
}: RouteControlsProps) {
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [weatherInterval, setWeatherInterval] = useState<number>(5);
  const [avgSpeed, setAvgSpeed] = useState<number>(20);

  // Initialize with tomorrow at 8am
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Set to tomorrow
    tomorrow.setHours(8, 0, 0, 0); // Set to 8:00:00.000 AM
    setStartTime(tomorrow);
  }, []);

  /**
   * Handle start time change
   * @param e - Input change event
   */
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      setStartTime(new Date(dateValue));
    }
  };

  /**
   * Handle generate forecast button click
   */
  const handleGenerateForecast = () => {
    console.log('Generate forecast button clicked');
    console.log('Settings:', { startTime, weatherInterval, avgSpeed });

    // Use onUpdateSettings if provided, otherwise fall back to onGenerateForecast
    if (onUpdateSettings) {
      console.log('Using onUpdateSettings handler');
      onUpdateSettings({ startTime, weatherInterval, avgSpeed });
    } else if (onGenerateForecast) {
      console.log('Using onGenerateForecast handler');
      onGenerateForecast(startTime, weatherInterval, avgSpeed);
    } else {
      console.warn('No handler provided for forecast generation');
    }
  };

  /**
   * Format date for datetime-local input
   * @param date - Date to format
   * @returns Formatted date string
   */
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  /**
   * Format interval value with units
   * @param value - Interval value
   * @returns Formatted string with units
   */
  const formatIntervalValue = (value: number): string => `${value} km`;

  /**
   * Format speed value with units
   * @param value - Speed value
   * @returns Formatted string with units
   */
  const formatSpeedValue = (value: number): string => `${value} km/h`;

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full">
      <div className="pb-3 px-4 sm:px-6">
        <h3 className="text-lg font-semibold">Route Settings</h3>
      </div>
      <div className="px-4 sm:px-6 pb-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="startTime" className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-500" />
              Start Time
            </Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formatDateForInput(startTime)}
              onChange={handleStartTimeChange}
              className="rounded-xl border-gray-200 focus:border-teal-500 transition-all duration-300"
            />
          </div>

          <div className="space-y-3 bg-gray-50 dark:bg-gray-800/60 p-3 sm:p-4 rounded-xl border border-gray-200">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <Label
                htmlFor="weatherInterval"
                className="text-sm font-medium flex items-center gap-1.5 sm:gap-2"
              >
                <Cloud className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-500" />
                Weather Interval
              </Label>
              <span className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 bg-teal-100 dark:bg-teal-900/20 rounded-full text-teal-600">
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
              thumbClassName="border-teal-500/50 dark:border-teal-500/50 bg-white dark:bg-slate-800 block size-5 shrink-0 border-2 rounded-full shadow-sm hover:border-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:ring-offset-2 transition-all duration-200"
            />
          </div>

          <div className="space-y-3 bg-gray-50 dark:bg-gray-800/60 p-3 sm:p-4 rounded-xl border border-gray-200">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <Label
                htmlFor="avgSpeed"
                className="text-sm font-medium flex items-center gap-1.5 sm:gap-2"
              >
                <Gauge className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-500" />
                Average Speed
              </Label>
              <span className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 bg-teal-100 dark:bg-teal-900/20 rounded-full text-teal-600">
                {formatSpeedValue(avgSpeed)}
              </span>
            </div>
            <Slider
              id="avgSpeed"
              min={5}
              max={50}
              step={1}
              value={[avgSpeed]}
              onValueChange={value => setAvgSpeed(value[0])}
              className="py-4"
              thumbClassName="border-teal-500/50 dark:border-teal-500/50 bg-white dark:bg-slate-800 block size-5 shrink-0 border-2 rounded-full shadow-sm hover:border-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:ring-offset-2 transition-all duration-200"
            />
          </div>

          <div className="flex items-center justify-center mt-6">
            <Button
              onClick={handleGenerateForecast}
              disabled={isGenerating}
              className="w-full py-2.5 sm:py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-full transition-all duration-300 hover:shadow-md active:scale-95 text-sm sm:text-base font-medium"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Forecast'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
