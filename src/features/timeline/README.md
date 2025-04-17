# Timeline Feature

This folder contains components for displaying and interacting with a timeline of forecast points.

## Components

- `Timeline`: The main timeline component that displays forecast points over time.
- `SafeTimelineWrapper`: A wrapper component that handles error boundaries and loading states.
- `ClientSideTimeline`: A client-side timeline component with navigation controls.

## Usage

```tsx
import { ClientSideTimeline } from '@/features/timeline/components';
import { ForecastPoint, WeatherData } from '@/features/weather/types';

const MyComponent = () => {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  const handleTimelineClick = (index: number) => {
    setSelectedMarker(index);
  };

  return (
    <ClientSideTimeline
      forecastPoints={forecastPoints}
      weatherData={weatherData}
      selectedMarker={selectedMarker}
      onTimelineClick={handleTimelineClick}
    />
  );
};
```

## Features

- Horizontal scrollable timeline
- Visual indicators for temperature, precipitation, and other weather data
- Selection highlighting synchronized with map and charts
- Responsive design that adapts to container size
- Keyboard navigation support
- Time and distance labels for each point
