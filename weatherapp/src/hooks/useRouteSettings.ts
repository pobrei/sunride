import { useCallback } from 'react';
import { useWeather } from '@/context/WeatherContext';
import { RouteSettings } from '@/types';

/**
 * Custom hook for handling route settings
 */
export function useRouteSettings() {
  const { generateWeatherForecast } = useWeather();

  /**
   * Update route settings and generate weather forecast
   */
  const updateSettings = useCallback(async (settings: RouteSettings) => {
    await generateWeatherForecast(
      settings.weatherInterval,
      settings.startTime,
      settings.avgSpeed
    );
  }, [generateWeatherForecast]);

  return {
    updateSettings
  };
}
