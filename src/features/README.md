# Features

This directory contains feature-based modules for the application. Each feature is organized into its own folder with components, utilities, types, and other related files.

## Feature Organization

Each feature folder follows a consistent structure:

- `components/`: React components specific to the feature
- `hooks/`: Custom React hooks for the feature
- `utils/`: Utility functions for the feature
- `types/`: TypeScript type definitions
- `context/`: React context providers and hooks
- `README.md`: Documentation for the feature

## Available Features

- [GPX](./gpx/README.md): GPX file handling and processing
- [Weather](./weather/README.md): Weather data and forecasting
- [Map](./map/README.md): Map visualization
- [Charts](./charts/README.md): Data visualization with charts
- [Timeline](./timeline/README.md): Timeline visualization
- [Route](./route/README.md): Route settings and sharing
- [Export](./export/README.md): Data export functionality
- [Data Validation](./data-validation/README.md): Data validation and safety
- [Notifications](./notifications/README.md): User notifications
- [Help](./help/README.md): User help and documentation
- [Navigation](./navigation/README.md): Application navigation
- [Database](./database/README.md): Database operations and API interactions
- [Monitoring](./monitoring/README.md): Monitoring and error tracking
- [Config](./config/README.md): Configuration and environment variables
- [UI](./ui/README.md): User interface utilities and components

## Best Practices

1. **Feature Independence**: Features should be as independent as possible, with clear dependencies.
2. **Consistent Exports**: Use index.ts files to export components and functions.
3. **Type Safety**: Use TypeScript types for all feature interfaces.
4. **Documentation**: Keep README.md files updated with usage examples.
5. **Testing**: Write tests for feature components and utilities.

## Example Usage

```tsx
// Import components from features
import { GPXUploader } from '@/features/gpx/components';
import { SafeMapWrapper } from '@/features/map/components';
import { SafeChartsWrapper } from '@/features/charts/components';
import { SafeTimelineWrapper } from '@/features/timeline/components';

// Import context hooks
import { useWeather } from '@/features/weather/context';
import { useNotifications } from '@/features/notifications/context';

const MyComponent = () => {
  // Use context hooks
  const { gpxData, forecastPoints, weatherData, setGpxData } = useWeather();
  const { addNotification } = useNotifications();

  // Handle GPX data loading
  const handleGPXLoaded = (data) => {
    setGpxData(data);
    addNotification('success', 'GPX file loaded successfully');
  };

  return (
    <div>
      <GPXUploader onGPXLoaded={handleGPXLoaded} />
      <SafeMapWrapper
        gpxData={gpxData}
        forecastPoints={forecastPoints}
        weatherData={weatherData}
      />
      <SafeChartsWrapper
        forecastPoints={forecastPoints}
        weatherData={weatherData}
      />
      <SafeTimelineWrapper
        forecastPoints={forecastPoints}
        weatherData={weatherData}
      />
    </div>
  );
};
```
