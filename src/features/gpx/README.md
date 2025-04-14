# GPX Feature

This folder contains components, utilities, and types related to GPX file handling and processing.

## Components

- `GPXUploader`: A component for uploading and parsing GPX files.

## Types

- `GPXData`: The main data structure for parsed GPX files.
- `RoutePoint`: Represents a single point in a GPX route.
- `GPXPoint`: Represents a raw point from a GPX file.
- `GPXTrack`: Represents a track from a GPX file.

## Utils

- `gpxParser`: Utilities for parsing GPX files and generating forecast points.
- `parseGPX`: Function to parse GPX XML into a structured format.
- `generateForecastPoints`: Function to generate forecast points from GPX data.

## Usage

```tsx
import { GPXUploader } from '@/features/gpx/components';
import { GPXData } from '@/features/gpx/types';

const MyComponent = () => {
  const handleGPXLoaded = (data: GPXData) => {
    console.log('GPX data loaded:', data);
  };

  return (
    <GPXUploader 
      onGPXLoaded={handleGPXLoaded} 
      isLoading={false} 
    />
  );
};
```
