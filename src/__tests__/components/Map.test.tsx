import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Map } from '@/features/map/components';
import { mockGPXData, mockForecastPoints, mockWeatherData } from '../mocks/mockData';
import { WeatherProvider } from '@/features/weather/context';
import { NotificationProvider } from '@/features/notifications/context';

// Mock the dynamic import
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: any) => {
    const Component = fn();
    Component.displayName = 'DynamicComponent';
    return Component;
  },
}));

// Mock OpenLayers
jest.mock('ol/Map', () => {
  return jest.fn().mockImplementation(() => ({
    setTarget: jest.fn(),
    addLayer: jest.fn(),
    addOverlay: jest.fn(),
    getView: jest.fn().mockReturnValue({
      setCenter: jest.fn(),
      setZoom: jest.fn(),
      fit: jest.fn(),
    }),
    on: jest.fn(),
    un: jest.fn(),
    dispose: jest.fn(),
  }));
});

jest.mock('ol/View', () => {
  return jest.fn().mockImplementation(() => ({
    setCenter: jest.fn(),
    setZoom: jest.fn(),
    fit: jest.fn(),
  }));
});

jest.mock('ol/layer/Tile', () => {
  return jest.fn().mockImplementation(() => ({
    setSource: jest.fn(),
  }));
});

jest.mock('ol/layer/Vector', () => {
  return jest.fn().mockImplementation(() => ({
    setSource: jest.fn(),
    setStyle: jest.fn(),
  }));
});

jest.mock('ol/source/OSM', () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock('ol/source/Vector', () => {
  return jest.fn().mockImplementation(() => ({
    addFeature: jest.fn(),
    addFeatures: jest.fn(),
    getFeatures: jest.fn().mockReturnValue([]),
  }));
});

jest.mock('ol/Feature', () => {
  return jest.fn().mockImplementation(() => ({
    setGeometry: jest.fn(),
    setStyle: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
  }));
});

jest.mock('ol/geom/LineString', () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock('ol/geom/Point', () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock('ol/style/Style', () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock('ol/style/Stroke', () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock('ol/style/Fill', () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock('ol/style/Circle', () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock('ol/style/Text', () => {
  return jest.fn().mockImplementation(() => ({}));
});

jest.mock('ol/Overlay', () => {
  return jest.fn().mockImplementation(() => ({
    setPosition: jest.fn(),
    setElement: jest.fn(),
  }));
});

jest.mock('ol/proj', () => ({
  fromLonLat: jest.fn().mockImplementation((coords) => coords),
}));

describe('Map Component', () => {
  const mockOnMarkerClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when no data is provided', () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Map
            gpxData={null}
            forecastPoints={[]}
            weatherData={[]}
            onMarkerClick={mockOnMarkerClick}
            selectedMarker={null}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders the map when data is provided', async () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Map
            gpxData={mockGPXData}
            forecastPoints={mockForecastPoints}
            weatherData={mockWeatherData}
            onMarkerClick={mockOnMarkerClick}
            selectedMarker={null}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Wait for the map to render
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check for map controls
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
  });

  it('calls onMarkerClick when a marker is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Map
            gpxData={mockGPXData}
            forecastPoints={mockForecastPoints}
            weatherData={mockWeatherData}
            onMarkerClick={mockOnMarkerClick}
            selectedMarker={null}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Wait for the map to render
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Find a marker and click it
    const marker = screen.getByTestId('map-marker-0');
    await user.click(marker);

    expect(mockOnMarkerClick).toHaveBeenCalledWith(0);
  });

  it('highlights the selected marker', async () => {
    render(
      <NotificationProvider>
        <WeatherProvider>
          <Map
            gpxData={mockGPXData}
            forecastPoints={mockForecastPoints}
            weatherData={mockWeatherData}
            onMarkerClick={mockOnMarkerClick}
            selectedMarker={1}
          />
        </WeatherProvider>
      </NotificationProvider>
    );

    // Wait for the map to render
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check that the selected marker has the selected class
    const selectedMarker = screen.getByTestId('map-marker-1');
    expect(selectedMarker).toHaveClass('selected');
  });
});
