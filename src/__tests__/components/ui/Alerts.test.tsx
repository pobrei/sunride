import React from 'react';
import { render, screen } from '../../utils/test-utils';
import { Alerts } from '@/features/weather/components';
import { mockForecastPoints, mockWeatherData } from '../../mocks/mockData';

describe('Alerts Component', () => {
  it('should render without crashing', () => {
    render(
      <Alerts
        forecastPoints={mockForecastPoints}
        weatherData={mockWeatherData}
      />
    );

    // Component should be in the document
    expect(screen.getByTestId('weather-alerts')).toBeInTheDocument();
  });

  it('should show no alerts message when there are no alerts', () => {
    // Create weather data with no extreme conditions
    const safeWeatherData = mockWeatherData.map(data => ({
      ...data,
      temperature: 20, // Moderate temperature
      windSpeed: 5, // Moderate wind
      rain: 0, // No rain
    }));

    render(
      <Alerts
        forecastPoints={mockForecastPoints}
        weatherData={safeWeatherData}
      />
    );

    expect(screen.getByText(/No weather alerts/i)).toBeInTheDocument();
  });

  it('should show high temperature alert', () => {
    // Create weather data with extreme heat
    const extremeHeatData = [...mockWeatherData];
    extremeHeatData[0] = {
      ...extremeHeatData[0],
      temperature: 35, // Very hot
    };

    render(
      <Alerts
        forecastPoints={mockForecastPoints}
        weatherData={extremeHeatData}
      />
    );

    expect(screen.getByText(/Extreme heat/i)).toBeInTheDocument();
  });

  it('should show freezing temperature alert', () => {
    // Create weather data with freezing temperature
    const freezingData = [...mockWeatherData];
    freezingData[0] = {
      ...freezingData[0],
      temperature: -5, // Below freezing
    };

    render(
      <Alerts
        forecastPoints={mockForecastPoints}
        weatherData={freezingData}
      />
    );

    expect(screen.getByText(/Freezing conditions/i)).toBeInTheDocument();
  });

  it('should show high wind alert', () => {
    // Create weather data with high wind
    const highWindData = [...mockWeatherData];
    highWindData[0] = {
      ...highWindData[0],
      windSpeed: 20, // Very windy
    };

    render(
      <Alerts
        forecastPoints={mockForecastPoints}
        weatherData={highWindData}
      />
    );

    expect(screen.getByText(/High wind/i)).toBeInTheDocument();
  });

  it('should show heavy rain alert', () => {
    // Create weather data with heavy rain
    const heavyRainData = [...mockWeatherData];
    heavyRainData[0] = {
      ...heavyRainData[0],
      rain: 10, // Heavy rain
    };

    render(
      <Alerts
        forecastPoints={mockForecastPoints}
        weatherData={heavyRainData}
      />
    );

    expect(screen.getByText(/Heavy rain/i)).toBeInTheDocument();
  });

  it('should handle empty data gracefully', () => {
    render(
      <Alerts
        forecastPoints={[]}
        weatherData={[]}
      />
    );

    expect(screen.getByText(/No weather alerts/i)).toBeInTheDocument();
  });
});
