# Export Feature

This folder contains components and utilities for exporting route and weather data.

## Components

- `PDFExport`: Component for exporting route and weather data to PDF format.

## Utils

- `pdfGenerator`: Utilities for generating PDF documents.

## Usage

```tsx
import { PDFExport } from '@/features/export/components';
import { GPXData } from '@/features/gpx/types';
import { ForecastPoint, WeatherData } from '@/features/weather/types';

const MyComponent = () => {
  return (
    <PDFExport
      gpxData={gpxData}
      forecastPoints={forecastPoints}
      weatherData={weatherData}
      selectedMarker={selectedMarker}
    />
  );
};
```

## Features

- Export route and weather data to PDF
- Customizable export options
- Include/exclude map, charts, and weather data
- Responsive design for different page sizes
- Progress indicator during export
- Error handling for failed exports
