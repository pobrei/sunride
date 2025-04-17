# Components Directory

This directory contains all the reusable UI components used in the SunRide application.

## Directory Structure

- **charts/**: Chart components for data visualization
  - Temperature, precipitation, wind, humidity, pressure, elevation, and UV index charts
  - Chart wrappers and utilities

- **common/**: Common utility components
  - Error boundaries
  - Fallback UIs
  - Offline detection

- **layout/**: Layout components
  - Header
  - Footer
  - Navigation
  - Page wrappers

- **map/**: Map components
  - MapWrapper
  - SimpleLeafletMap

- **route/**: Route-related components
  - TripSummary

- **timeline/**: Timeline components
  - Timeline
  - ClientSideTimeline
  - SafeTimelineWrapper

- **ui/**: Basic UI components (shadcn/ui)
  - Buttons, cards, inputs, etc.
  - Loading indicators
  - Error messages
  - Theme toggle

- **weather/**: Weather-related components
  - WeatherAlerts

## Usage

Import components directly from their respective directories:

```tsx
import { Button } from '@/components/ui/button';
import { MapWrapper } from '@/components/map';
import { ClientSideTimeline } from '@/components/timeline';
import { EnhancedThemeToggle } from '@/components/ui/enhanced-theme-toggle';
```

Or use the index files for grouped imports:

```tsx
import { Button, Card, Input } from '@/components/ui';
```
