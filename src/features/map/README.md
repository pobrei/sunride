# Map Feature

This folder contains components and utilities related to map visualization.

## Components

- `Map`: The main map component that displays GPX routes and weather data.
- `OpenLayersMap`: Implementation of the map using OpenLayers.
- `SafeMapWrapper`: A wrapper component that handles error boundaries and loading states.
- `DynamicMap`: A dynamically loaded map component for client-side rendering.
- `SimpleMap`: A simplified map component for fallback or low-resource environments.

## Usage

```tsx
import { SafeMapWrapper } from '@/features/map/components';
import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';

const MyComponent = () => {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  
  const handleMarkerClick = (index: number) => {
    setSelectedMarker(index);
  };

  return (
    <SafeMapWrapper
      gpxData={gpxData}
      forecastPoints={forecastPoints}
      weatherData={weatherData}
      onMarkerClick={handleMarkerClick}
      selectedMarker={selectedMarker}
    />
  );
};
```

## OpenLayers Integration

The map components use OpenLayers for rendering interactive maps. Key features include:

- Displaying GPX routes as polylines
- Showing weather data as markers
- Interactive markers with weather information
- Zoom and pan controls
- Keyboard navigation support
