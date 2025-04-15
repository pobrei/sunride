'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GPXErrorFallback } from './GPXErrorFallback';
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
 * Error boundary specifically for GPX-related components
 * Catches errors in the GPX feature and displays a fallback UI
 */
export class GPXErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to Sentry with GPX-specific context
    captureException(error, {
      tags: { feature: 'gpx' },
      extra: errorInfo,
    });

    // Call the optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('GPX feature error:', error, errorInfo);
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

      // Otherwise use the GPX-specific fallback UI
      return (
        <GPXErrorFallback
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
 * Higher-order component that wraps a component with the GPXErrorBoundary
 * @param Component - The component to wrap
 * @returns Wrapped component with error boundary
 */
export function withGPXErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { onError?: (error: Error, errorInfo: ErrorInfo) => void; onRetry?: () => void }> {
  return props => (
    <GPXErrorBoundary onError={props.onError} onRetry={props.onRetry}>
      <Component {...props} />
    </GPXErrorBoundary>
  );
}
