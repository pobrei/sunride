# Monitoring Feature

This folder contains utilities for monitoring and error tracking.

## Utils

- `sentry.ts`: Sentry integration for error tracking and monitoring

## Usage

```tsx
import { captureException, captureMessage, initSentry } from '@/features/monitoring';

// Initialize Sentry
initSentry();

// Capture an exception
try {
  // Some code that might throw an error
} catch (error) {
  captureException(error, { context: 'fetchData', userId: '123' });
}

// Capture a message
captureMessage('User logged in', 'info');
```

## Features

- Error tracking with context
- Message logging with severity levels
- User tracking
- Mock implementation for development
