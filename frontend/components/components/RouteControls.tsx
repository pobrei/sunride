'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { Input } from '@frontend/components/ui/input';
import { Label } from '@frontend/components/ui/label';
import { Button } from '@frontend/components/ui/button';
import { Slider } from '@frontend/components/ui/slider';
import { Save, RefreshCw } from 'lucide-react';

interface RouteControlsProps {
  onUpdateSettings: (settings: RouteSettings) => void;
  onExportPDF: () => void;
  isGenerating: boolean;
  isExporting: boolean;
}

export interface RouteSettings {
  startTime: Date;
  weatherInterval: number;
  avgSpeed: number;
}

export default function RouteControls({
  onUpdateSettings,
  onExportPDF,
  isGenerating,
  isExporting,
}: RouteControlsProps) {
  // Get tomorrow at 8:00 AM for default start time
  const getDefaultStartTime = () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow;
  };

  const [startTime, setStartTime] = useState<Date>(getDefaultStartTime());
  const [weatherInterval, setWeatherInterval] = useState<number>(5);
  const [avgSpeed, setAvgSpeed] = useState<number>(20);

  // Convert date to string format for datetime-local input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Handle start time change
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = new Date(e.target.value);
    setStartTime(newStartTime);
  };

  // Generate forecast based on current settings
  const handleGenerateForecast = () => {
    onUpdateSettings({
      startTime,
      weatherInterval,
      avgSpeed,
    });
  };

  // Format the interval and speed values for display
  const formatIntervalValue = (value: number) => `${value} km`;
  const formatSpeedValue = (value: number) => `${value} km/h`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Route Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
              className="py-2"
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
              className="py-2"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerateForecast} disabled={isGenerating} className="flex-1">
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Forecast'
              )}
            </Button>

            <Button onClick={onExportPDF} disabled={isExporting || isGenerating} variant="outline">
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
