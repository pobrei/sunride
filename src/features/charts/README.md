# Charts Feature

This folder contains components for visualizing weather data in chart format.

## Components

- `EnhancedClientCharts`: A client-side chart component with error handling and loading states.
- `EnhancedChartContainer`: A container component that manages multiple enhanced chart components.
- `ChartContainer`: A container component that manages basic chart components.

### Individual Charts

- `TemperatureChart`: Displays temperature data over time/distance.
- `PrecipitationChart`: Displays precipitation data over time/distance.
- `WindChart`: Displays wind speed data over time/distance.
- `HumidityChart`: Displays humidity data over time/distance.
- `PressureChart`: Displays atmospheric pressure data over time/distance.
- `UVIndexChart`: Displays UV index data over time/distance.
- `ElevationChart`: Displays elevation data over distance.

## Usage

```tsx
import { EnhancedClientCharts } from '@/features/charts/components';
import { ForecastPoint, WeatherData } from '@/features/weather/types';
import { GPXData } from '@/features/gpx/types';

const MyComponent = () => {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  const handleChartClick = (index: number) => {
    setSelectedMarker(index);
  };

  return (
    <EnhancedClientCharts
      gpxData={gpxData}
      forecastPoints={forecastPoints}
      weatherData={weatherData}
      selectedMarker={selectedMarker}
      onChartClick={handleChartClick}
      height="h-[400px]"
    />
  );
};
```

## Chart.js Integration

The chart components use Chart.js for rendering interactive charts. Key features include:

- Responsive design that adapts to container size
- Interactive tooltips showing detailed data
- Click handling to select data points
- Synchronized selection with other components (map, timeline)
- Dark/light mode support with appropriate color schemes
