import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChartContainer } from '@/features/charts/components';
import { mockGPXData, mockForecastPoints, mockWeatherData } from '../mocks/mockData';
import { WeatherProvider } from '@/features/weather/context';
import { NotificationProvider } from '@/features/notifications/context';

// Mock Chart.js
jest.mock('chart.js/auto', () => {
  return jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
  }));
});

// Mock the individual chart components
jest.mock('@/features/charts/components/individual/TemperatureChart', () => {
  return {
    __esModule: true,
    default: ({ forecastPoints, weatherData, selectedMarker, onChartClick }) => (
      <div data-testid="temperature-chart">
        <button onClick={() => onChartClick(1)}>Select Point 1</button>
        <div>Temperature Chart</div>
        <div>Selected: {selectedMarker !== null ? `Point ${selectedMarker}` : 'None'}</div>
      </div>
    ),
  };
});

jest.mock('@/features/charts/components/individual/PrecipitationChart', () => {
  return {
    __esModule: true,
    default: ({ forecastPoints, weatherData, selectedMarker, onChartClick }) => (
      <div data-testid="precipitation-chart">
        <button onClick={() => onChartClick(2)}>Select Point 2</button>
        <div>Precipitation Chart</div>
        <div>Selected: {selectedMarker !== null ? `Point ${selectedMarker}` : 'None'}</div>
      </div>
    ),
  };
});

jest.mock('@/features/charts/components/individual/WindChart', () => {
  return {
    __esModule: true,
    default: ({ forecastPoints, weatherData, selectedMarker, onChartClick }) => (
      <div data-testid="wind-chart">
        <button onClick={() => onChartClick(3)}>Select Point 3</button>
        <div>Wind Chart</div>
        <div>Selected: {selectedMarker !== null ? `Point ${selectedMarker}` : 'None'}</div>
      </div>
    ),
  };
});

// Mock the other chart components
jest.mock('@/features/charts/components/individual/HumidityChart', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="humidity-chart">Humidity Chart</div>,
  };
});

jest.mock('@/features/charts/components/individual/PressureChart', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="pressure-chart">Pressure Chart</div>,
  };
});

jest.mock('@/features/charts/components/individual/ElevationChart', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="elevation-chart">Elevation Chart</div>,
  };
});

jest.mock('@/features/charts/components/individual/UVIndexChart', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="uv-index-chart">UV Index Chart</div>,
  };
});

describe('ChartContainer Component', () => {
  const mockOnChartClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all chart components', () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <ChartContainer
            gpxData={mockGPXData}
            forecastPoints={mockForecastPoints}
            weatherData={mockWeatherData}
            selectedMarker={null}
            onChartClick={mockOnChartClick}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Check that all chart components are rendered
    expect(screen.getByTestId('temperature-chart')).toBeInTheDocument();
    expect(screen.getByTestId('precipitation-chart')).toBeInTheDocument();
    expect(screen.getByTestId('wind-chart')).toBeInTheDocument();
    expect(screen.getByTestId('humidity-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pressure-chart')).toBeInTheDocument();
    expect(screen.getByTestId('elevation-chart')).toBeInTheDocument();
    expect(screen.getByTestId('uv-index-chart')).toBeInTheDocument();
  });

  it('calls onChartClick when a chart point is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <NotificationProvider>
        <WeatherProvider>
          <ChartContainer
            gpxData={mockGPXData}
            forecastPoints={mockForecastPoints}
            weatherData={mockWeatherData}
            selectedMarker={null}
            onChartClick={mockOnChartClick}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Click on a point in the temperature chart
    await user.click(screen.getByText('Select Point 1'));
    expect(mockOnChartClick).toHaveBeenCalledWith(1);

    // Click on a point in the precipitation chart
    await user.click(screen.getByText('Select Point 2'));
    expect(mockOnChartClick).toHaveBeenCalledWith(2);

    // Click on a point in the wind chart
    await user.click(screen.getByText('Select Point 3'));
    expect(mockOnChartClick).toHaveBeenCalledWith(3);
  });

  it('highlights the selected marker in all charts', () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <ChartContainer
            gpxData={mockGPXData}
            forecastPoints={mockForecastPoints}
            weatherData={mockWeatherData}
            selectedMarker={2}
            onChartClick={mockOnChartClick}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Check that the selected marker is highlighted in all charts
    expect(screen.getAllByText('Selected: Point 2')).toHaveLength(3);
  });

  it('returns null when no data is provided', () => {
    const { container } = render(
      <NotificationProvider>
        <WeatherProvider>
          <ChartContainer
            gpxData={mockGPXData}
            forecastPoints={[]}
            weatherData={[]}
            selectedMarker={null}
            onChartClick={mockOnChartClick}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Check that nothing is rendered
    expect(container.firstChild).toBeNull();
  });
});
