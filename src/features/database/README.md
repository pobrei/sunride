# Database Feature

This folder contains utilities for database operations and API interactions.

## Utils

- `mongodb.ts`: MongoDB client configuration with mock support for development
- `mongodb-api.ts`: Client-side API wrapper for MongoDB operations

## Usage

```tsx
import { mongodbClient, fetchWeatherForPoints } from '@/features/database';
import { ForecastPoint } from '@/features/weather/types';

// Using MongoDB client
const client = await mongodbClient;
const db = client.db('weatherapp');
const collection = db.collection('weather');

// Using API wrapper
const points: ForecastPoint[] = [
  { lat: 37.7749, lon: -122.4194, timestamp: 1634292000, distance: 0 }
];

try {
  const weatherData = await fetchWeatherForPoints(points);
  console.log('Weather data:', weatherData);
} catch (error) {
  console.error('Error fetching weather data:', error);
}
```

## Features

- MongoDB client with connection pooling
- Mock client for development without MongoDB
- API wrapper with retry logic and error handling
- Validation for API requests
- Timeout handling for network requests
