# Testing Documentation

This directory contains tests for the SunRide project. The tests are organized by type and component.

## Test Structure

- `__tests__/components/`: Tests for UI components
- `__tests__/utils/`: Tests for utility functions
- `__tests__/hooks/`: Tests for React hooks
- `__tests__/integration/`: Integration tests for complete features
- `__tests__/mocks/`: Mock data and functions for testing
- `__tests__/setup/`: Test setup files

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run a specific test file
npm test -- path/to/test.js
```

## Test Files

### Component Tests

- `GPXUploader.test.tsx`: Tests for the GPX file upload component
- `Map.test.tsx`: Tests for the map visualization component
- `Timeline.test.tsx`: Tests for the timeline navigation component

### Utility Tests

- `gpxParser.test.ts`: Tests for GPX file parsing functions
- `weatherService.test.ts`: Tests for weather data validation and processing
- `weatherDataMerging.test.ts`: Tests for merging weather data with route points
- `distanceSampling.test.ts`: Tests for sampling route points at regular intervals
- `errorHandling.test.ts`: Tests for error handling utilities

### Hook Tests

- `useApi.test.ts`: Tests for the API hook
- `useWeatherAPI.test.ts`: Tests for the weather API hook

### Integration Tests

- `GPXUploadFlow.test.tsx`: Tests for the complete GPX upload and weather data flow

## Mock Data

The `mocks/` directory contains mock data and functions for testing:

- `mockData.ts`: Mock GPX and weather data
- `mockFetch.ts`: Mock implementations of the fetch API

## Test Utilities

The `utils/` directory contains utilities for testing:

- `test-utils.tsx`: Custom render function with providers

## Writing Tests

When writing tests, follow these guidelines:

1. Use descriptive test names that explain what is being tested
2. Follow the AAA pattern: Arrange, Act, Assert
3. Mock external dependencies
4. Test edge cases and error conditions
5. Keep tests independent and isolated
6. Use the provided mock data and utilities
