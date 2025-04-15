# Charts Feature

This folder contains components for visualizing weather data in chart format.

## Components

- `SafeChartsWrapper`: A wrapper component that handles error boundaries and loading states.
- `ChartContainer`: A container component that manages multiple chart components.

### Individual Charts

- `TemperatureChart`: Displays temperature data over time/distance.
- `PrecipitationChart`: Displays precipitation data over time/distance.
- `WindChart`: Displays wind speed data over time/distance.

## Usage

```tsx
import { SafeChartsWrapper } from '@/features/charts/components';
import { ForecastPoint, WeatherData } from '@/features/weather/types';

const MyComponent = () => {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  const handleChartClick = (index: number) => {
    setSelectedMarker(index);
  };

  return (
    <SafeChartsWrapper
      forecastPoints={forecastPoints}
      weatherData={weatherData}
      selectedMarker={selectedMarker}
      onChartClick={handleChartClick}
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
