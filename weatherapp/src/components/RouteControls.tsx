'use client';

import { useState, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Save, RefreshCw, Clock, Gauge, Ruler } from 'lucide-react';
import { RouteSettings } from '@/types';

interface RouteControlsProps {
  onUpdateSettings: (settings: RouteSettings) => void;
  onExportPDF: () => void;
  isGenerating: boolean;
  isExporting: boolean;
}

/**
 * Button component with loading state
 */
const ActionButton = memo(({
  onClick,
  isLoading,
  loadingText,
  icon,
  text,
  disabled = false,
  variant = 'primary'
}: {
  onClick: () => void;
  isLoading: boolean;
  loadingText: string;
  icon: React.ReactNode;
  text: string;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
}) => {
  const isPrimary = variant === 'primary';
  const className = isPrimary
    ? "flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-sm h-11"
    : "border-border/50 hover:bg-primary/5 transition-colors shadow-sm h-11";

  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      variant={isPrimary ? 'default' : 'outline'}
      className={className}
      size="lg"
      aria-label={text}
    >
      {isLoading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {icon}
          {text}
        </>
      )}
    </Button>
  );
});

ActionButton.displayName = 'ActionButton';

/**
 * Slider with label and value display
 */
const SettingSlider = memo(({
  id,
  label,
  icon,
  value,
  min,
  max,
  step = 1,
  formatValue,
  onChange
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  formatValue: (value: number) => string;
  onChange: (value: number) => void;
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="flex items-center text-[#374151] dark:text-foreground font-medium">
          {icon}
          {label}
        </Label>
        <span className="text-sm font-medium text-[#6b7280] dark:text-muted-foreground bg-primary/5 px-2 py-1 rounded-md">
          {formatValue(value)}
        </span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        className="py-3"
        aria-label={label}
      />
    </div>
  );
});

SettingSlider.displayName = 'SettingSlider';

/**
 * Helper functions for date formatting and defaults
 */
const dateUtils = {
  getDefaultStartTime: () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow;
  },

  formatDateForInput: (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  },

  formatIntervalValue: (value: number) => `${value} km`,
  formatSpeedValue: (value: number) => `${value} km/h`
};

/**
 * Route controls component for configuring route settings
 */
function RouteControls({
  onUpdateSettings,
  onExportPDF,
  isGenerating,
  isExporting
}: RouteControlsProps) {
  // State for route settings
  const [startTime, setStartTime] = useState<Date>(dateUtils.getDefaultStartTime());
  const [weatherInterval, setWeatherInterval] = useState<number>(5);
  const [avgSpeed, setAvgSpeed] = useState<number>(20);

  /**
   * Handle start time change from input
   */
  const handleStartTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = new Date(e.target.value);
    if (!isNaN(newStartTime.getTime())) { // Validate date is valid
      setStartTime(newStartTime);
    }
  }, []);

  /**
   * Generate forecast with current settings
   */
  const handleGenerateForecast = useCallback(() => {
    onUpdateSettings({
      startTime,
      weatherInterval,
      avgSpeed
    });
  }, [startTime, weatherInterval, avgSpeed, onUpdateSettings]);

  /**
   * Handle weather interval change
   */
  const handleIntervalChange = useCallback((value: number) => {
    setWeatherInterval(value);
  }, []);

  /**
   * Handle average speed change
   */
  const handleSpeedChange = useCallback((value: number) => {
    setAvgSpeed(value);
  }, []);

  return (
    <Card className="card-shadow-sm border border-border/50 rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="text-lg font-semibold flex items-center">
          <div className="bg-primary/10 p-1.5 rounded-full mr-2">
            <Gauge className="h-5 w-5 text-primary" />
          </div>
          Route Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-6">
          {/* Start Time Input */}
          <div className="space-y-2">
            <Label
              htmlFor="startTime"
              className="flex items-center text-[#374151] dark:text-foreground font-medium"
            >
              <Clock className="h-4 w-4 mr-2 text-primary" />
              Start Time
            </Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={dateUtils.formatDateForInput(startTime)}
              onChange={handleStartTimeChange}
              className="border-border/50 bg-white dark:bg-background rounded-lg focus:ring-primary/20 focus:border-primary/50"
              aria-label="Route start time"
            />
          </div>

          {/* Weather Interval Slider */}
          <SettingSlider
            id="weatherInterval"
            label="Weather Interval"
            icon={<Ruler className="h-4 w-4 mr-2 text-primary" />}
            value={weatherInterval}
            min={1}
            max={20}
            formatValue={dateUtils.formatIntervalValue}
            onChange={handleIntervalChange}
          />

          {/* Average Speed Slider */}
          <SettingSlider
            id="avgSpeed"
            label="Average Speed"
            icon={<Gauge className="h-4 w-4 mr-2 text-primary" />}
            value={avgSpeed}
            min={5}
            max={50}
            formatValue={dateUtils.formatSpeedValue}
            onChange={handleSpeedChange}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <ActionButton
              onClick={handleGenerateForecast}
              isLoading={isGenerating}
              loadingText="Generating..."
              icon={<RefreshCw className="mr-2 h-4 w-4" />}
              text="Generate Forecast"
              variant="primary"
            />

            <ActionButton
              onClick={onExportPDF}
              isLoading={isExporting}
              loadingText="Exporting..."
              icon={<Save className="mr-2 h-4 w-4 text-primary" />}
              text="Export PDF"
              variant="outline"
              disabled={isGenerating}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(RouteControls);