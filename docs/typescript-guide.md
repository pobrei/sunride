# TypeScript Best Practices Guide

This guide outlines the TypeScript best practices for this project to ensure type safety and developer confidence.

## Type Definitions

### Feature-Specific Types

Each feature folder should have its own `types` directory with an `index.ts` file that exports all types related to that feature:

```typescript
// src/features/weather/types/index.ts
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  // ...other properties
}

export interface ForecastPoint {
  lat: number;
  lon: number;
  timestamp: number;
  distance: number;
}
```

### Shared Types

Common types used across multiple features should be defined in the main `types` directory:

```typescript
// src/types/index.ts
import { WeatherData, ForecastPoint } from '@/features/weather/types';
import { GPXData, RoutePoint } from '@/features/gpx/types';

// Re-export feature types
export type { WeatherData, ForecastPoint, GPXData, RoutePoint };

// Define shared types
export interface NotificationType {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  // ...other properties
}
```

## Avoiding `any` Type

Avoid using the `any` type whenever possible. Instead, use:

### Type Guards

```typescript
// src/utils/typeGuards.ts
export function isWeatherData(value: unknown): value is WeatherData {
  if (!value || typeof value !== 'object') return false;

  const data = value as Partial<WeatherData>;

  return (
    typeof data.temperature === 'number' &&
    typeof data.humidity === 'number' &&
    // ...check other properties
  );
}
```

### Utility Types

```typescript
// Use Partial for optional properties
function updateWeatherData(data: Partial<WeatherData>): void {
  // ...
}

// Use Record for dynamic properties
const weatherByCity: Record<string, WeatherData> = {};

// Use unknown instead of any for values that need type checking
function processData(data: unknown): WeatherData {
  if (isWeatherData(data)) {
    return data;
  }
  throw new Error('Invalid data');
}
```

## Component Props

Always define prop types for React components:

```typescript
// Define props interface
interface WeatherCardProps {
  data: WeatherData;
  onRefresh?: () => void;
  isLoading?: boolean;
}

// Use with function component
const WeatherCard: React.FC<WeatherCardProps> = ({ data, onRefresh, isLoading = false }) => {
  // ...
};

// Or with type annotation
function WeatherCard({ data, onRefresh, isLoading = false }: WeatherCardProps) {
  // ...
}
```

## API Functions

Always define return types for API functions:

```typescript
async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  // ...
}

// For functions that might fail, use a Result type
interface Result<T> {
  data: T | null;
  error: Error | null;
}

async function fetchWeatherData(lat: number, lon: number): Promise<Result<WeatherData>> {
  try {
    // ...
    return { data: weatherData, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
```

## Type Checking Tools

We have several tools to help maintain type safety:

1. **TypeScript Compiler**: Run `npm run check:types` to check for type errors.
2. **TypeScript Issue Checker**: Run `npm run check:ts` to find TypeScript issues like `any` types and missing type annotations.
3. **Any Type Checker**: Run `npm run check:any` to specifically find `any` types in the codebase.

## Handling Dynamic Data

When working with data from external sources (API responses, user input, etc.), use type assertions with validation:

```typescript
// Parse and validate API response
function parseWeatherResponse(response: unknown): WeatherData {
  // Validate response structure
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response');
  }

  const data = response as Record<string, unknown>;

  // Validate required fields
  if (typeof data.temperature !== 'number') {
    throw new Error('Invalid temperature');
  }

  // Create validated object
  return {
    temperature: data.temperature,
    feelsLike: typeof data.feelsLike === 'number' ? data.feelsLike : data.temperature,
    humidity: typeof data.humidity === 'number' ? data.humidity : 0,
    // ...other properties with validation
  };
}
```

## Using Zod for Runtime Validation

For complex validation, consider using Zod:

```typescript
import { z } from 'zod';

// Define schema
const weatherSchema = z.object({
  temperature: z.number(),
  feelsLike: z.number().optional(),
  humidity: z.number().min(0).max(100),
  // ...other properties
});

// Type derived from schema
type WeatherData = z.infer<typeof weatherSchema>;

// Validate data
function validateWeatherData(data: unknown): WeatherData {
  return weatherSchema.parse(data);
}
```

## Conclusion

Following these TypeScript best practices will help ensure type safety throughout the application, reduce runtime errors, and improve developer experience.
