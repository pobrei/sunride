# Weather Feature

This folder contains components, utilities, and types related to weather data and forecasting.

## Components

- `Alerts`: Displays weather alerts based on forecast data.
- `WeatherInfoPanel`: Displays detailed weather information for a selected point.
- `WeatherProviderComparison`: Compares weather data from different providers.

## Context

- `WeatherContext`: Provides weather data and related functions to components.
- `useWeather`: Hook to access weather data and functions.

## Types

- `WeatherData`: The main data structure for weather information.
- `ForecastPoint`: Represents a point in time and space for a weather forecast.
- `WeatherProvider`: Represents a weather data provider.

## Utils

- `weatherAPI`: Functions for fetching weather data from APIs.
- `weatherProviders`: Configuration for different weather providers.
- `weatherService`: Service for processing and managing weather data.

## Usage

```tsx
import { useWeather } from '@/features/weather/context';
import { Alerts } from '@/features/weather/components';

const MyComponent = () => {
  const { forecastPoints, weatherData } = useWeather();

  return (
    <Alerts 
      forecastPoints={forecastPoints} 
      weatherData={weatherData} 
    />
  );
};
```
