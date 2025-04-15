# Map Feature

This folder contains components and utilities related to map visualization.

## Components

- `SimpleMap`: The main map component that displays GPX routes and weather data.

## Usage

```tsx
import { SimpleMap } from '@/features/map/components';
import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';

const MyComponent = () => {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  const handleMarkerClick = (index: number) => {
    setSelectedMarker(index);
  };

  return (
    <SimpleMap
      gpxData={gpxData}
      forecastPoints={forecastPoints}
      weatherData={weatherData}
      onMarkerClick={handleMarkerClick}
      selectedMarker={selectedMarker}
    />
  );
};
```

## Leaflet Integration

The map component uses Leaflet for rendering interactive maps. Key features include:

- Displaying GPX routes as polylines
- Showing weather data as markers
- Interactive markers with weather information
- Zoom and pan controls
- Keyboard navigation support
