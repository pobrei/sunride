# Route Feature

This folder contains components for managing route settings and sharing.

## Components

- `RouteControls`: Controls for adjusting route settings like start time and average speed.
- `RouteSharing`: Component for sharing route information with others.

## Types

- `RouteSettings`: Configuration for route parameters.
- `RouteMetrics`: Calculated metrics for a route.

## Usage

```tsx
import { RouteControls } from '@/features/route/components';
import { useWeather } from '@/features/weather/context';

const MyComponent = () => {
  const { generateWeatherForecast } = useWeather();
  
  const handleSettingsChange = (settings: RouteSettings) => {
    generateWeatherForecast(
      settings.weatherInterval,
      settings.startTime,
      settings.avgSpeed
    );
  };

  return (
    <RouteControls 
      onSettingsChange={handleSettingsChange}
      isLoading={false}
    />
  );
};
```

## Features

- Adjustable start time with date/time picker
- Configurable average speed for accurate time estimates
- Weather interval settings to control forecast density
- Route sharing via URL, email, or social media
- Copy to clipboard functionality
