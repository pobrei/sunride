'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { WeatherFallbackUI } from './WeatherFallbackUI';
import { captureException } from '@/features/monitoring';

interface Props {
  /** The children to render */
  children: ReactNode;
  /** Optional fallback component */
  fallback?: ReactNode;
  /** Optional error handler */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Optional retry function */
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary specifically for weather-related components
 * Catches errors in the weather feature and displays a fallback UI
 */
export class WeatherErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to Sentry with weather-specific context
    captureException(error, { 
      tags: { feature: 'weather' },
      extra: errorInfo 
    });

    // Call the optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('Weather feature error:', error, errorInfo);
  }

  public reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise use the weather-specific fallback UI
      return (
        <WeatherFallbackUI 
          error={this.state.error} 
          onRetry={() => {
            this.reset();
            if (this.props.onRetry) {
              this.props.onRetry();
            }
          }} 
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component that wraps a component with the WeatherErrorBoundary
 * @param Component - The component to wrap
 * @returns Wrapped component with error boundary
 */
export function withWeatherErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { onError?: (error: Error, errorInfo: ErrorInfo) => void; onRetry?: () => void }> {
  return (props) => (
    <WeatherErrorBoundary onError={props.onError} onRetry={props.onRetry}>
      <Component {...props} />
    </WeatherErrorBoundary>
  );
}
