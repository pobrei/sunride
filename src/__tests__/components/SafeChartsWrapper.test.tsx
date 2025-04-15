import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SafeChartsWrapper } from '@/features/charts/components';
import { mockGPXData, mockForecastPoints, mockWeatherData } from '../mocks/mockData';
import { WeatherProvider } from '@/features/weather/context';
import { NotificationProvider } from '@/features/notifications/context';

// Mock the ChartContainer component
jest.mock('@/features/charts/components/ChartContainer', () => {
  return {
    __esModule: true,
    default: ({ gpxData, forecastPoints, weatherData, selectedMarker, onChartClick }) => (
      <div data-testid="chart-container">
        <div>Chart Container</div>
        <div>Selected: {selectedMarker !== null ? `Point ${selectedMarker}` : 'None'}</div>
        <button onClick={() => onChartClick(1)}>Select Point 1</button>
      </div>
    ),
  };
});

// Mock the useSafeData hook
jest.mock('@/features/data-validation/context', () => ({
  useSafeData: () => ({
    validateGPXData: jest.fn(data => data),
    validateForecastPoints: jest.fn(data => data),
    validateWeatherData: jest.fn(data => data),
  }),
}));

describe('SafeChartsWrapper Component', () => {
  const mockOnChartClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() },
      writable: true,
    });
  });

  it('renders the chart container when data is valid', () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <SafeChartsWrapper
            gpxData={mockGPXData}
            forecastPoints={mockForecastPoints}
            weatherData={mockWeatherData}
            selectedMarker={null}
            onChartClick={mockOnChartClick}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Check that the chart container is rendered
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
    expect(screen.getByText('Chart Container')).toBeInTheDocument();
  });

  it('passes the selected marker to the chart container', () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <SafeChartsWrapper
            gpxData={mockGPXData}
            forecastPoints={mockForecastPoints}
            weatherData={mockWeatherData}
            selectedMarker={2}
            onChartClick={mockOnChartClick}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Check that the selected marker is passed to the chart container
    expect(screen.getByText('Selected: Point 2')).toBeInTheDocument();
  });

  it('calls onChartClick when a chart point is clicked', () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <SafeChartsWrapper
            gpxData={mockGPXData}
            forecastPoints={mockForecastPoints}
            weatherData={mockWeatherData}
            selectedMarker={null}
            onChartClick={mockOnChartClick}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Click on a point in the chart
    fireEvent.click(screen.getByText('Select Point 1'));
    expect(mockOnChartClick).toHaveBeenCalledWith(1);
  });

  it('shows an error UI when data is invalid', () => {
    // Mock the useSafeData hook to return invalid data
    jest.mock('@/features/data-validation/context', () => ({
      useSafeData: () => ({
        validateGPXData: jest.fn(() => null),
        validateForecastPoints: jest.fn(() => []),
        validateWeatherData: jest.fn(() => []),
      }),
    }));

    // Force the component to show the error UI
    jest.spyOn(React, 'useEffect').mockImplementationOnce(f => f());
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()]);

    render(
      <NotificationProvider>
        <WeatherProvider>
          <SafeChartsWrapper
            gpxData={null}
            forecastPoints={[]}
            weatherData={[]}
            selectedMarker={null}
            onChartClick={mockOnChartClick}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Check that the error UI is rendered
    expect(screen.getByText('Chart Data Error')).toBeInTheDocument();
    expect(screen.getByText(/we couldn't display the charts/i)).toBeInTheDocument();

    // Check that the reload button is rendered
    const reloadButton = screen.getByText('Reload Page');
    expect(reloadButton).toBeInTheDocument();

    // Click the reload button
    fireEvent.click(reloadButton);
    expect(window.location.reload).toHaveBeenCalled();
  });
});
