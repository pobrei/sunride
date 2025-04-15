# Config Feature

This folder contains utilities for configuration and environment variables.

## Utils

- `env.ts`: Environment variable configuration and validation

## Usage

```tsx
import { envConfig, validateApiKey } from '@/features/config';

// Access environment variables
const { openWeatherApiKey, mongodbUri, isDevelopment } = envConfig;

// Validate an API key
const apiKey = validateApiKey(envConfig.mapboxAccessToken, 'MAPBOX_ACCESS_TOKEN');
```

## Features

- Type-safe access to environment variables
- Validation of required environment variables
- Parsing of numeric and boolean environment variables
- Environment detection (development, production, test)
- API key validation
