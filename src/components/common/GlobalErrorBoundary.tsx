'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException } from '@/lib/sentry';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
// We can't use hooks in class components

interface Props {
  /** The children to render */
  children: ReactNode;
  /** Whether to show a full-page error */
  fullPage?: boolean;
  /** Optional fallback component */
  fallback?: ReactNode;
  /** Optional error handler */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that occurred */
  error: Error | null;
}

/**
 * A component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to Sentry
    captureException(error, { extra: errorInfo });

    // Call the optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = (): void => {
    // Reload the page
    window.location.reload();
  };

  private handleGoHome = (): void => {
    // Navigate to the home page
    window.location.href = '/';
  };

  private handleDismiss = (): void => {
    // Reset the error state
    this.setState({ hasError: false, error: null });

    // Show a notification
    // Note: We can't use the hook directly in a class component
    // so we'll use a workaround with a custom event
    const event = new CustomEvent('show-notification', {
      detail: {
        type: 'warning',
        message:
          'The error has been dismissed, but the application may still be in an unstable state.',
      },
    });
    document.dispatchEvent(event);
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, use the default fallback UI
      const errorMessage = this.state.error?.message || 'An unknown error occurred';

      if (this.props.fullPage) {
        return (
          <div className="flex items-center justify-center min-h-screen p-4 bg-background">
            <Card className="w-full max-w-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Application Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{errorMessage}</p>
                <p className="text-sm text-muted-foreground">
                  This error has been reported to our team. You can try reloading the page or going
                  back to the home page.
                </p>
              </CardContent>
              <CardFooter className="flex gap-2 justify-start">
                <Button
                  variant="default"
                  className="flex items-center gap-2"
                  onClick={this.handleReload}
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={this.handleGoHome}
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      }

      return (
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Component Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{errorMessage}</p>
          </CardContent>
          <CardFooter className="flex gap-2 justify-start">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={this.handleDismiss}
            >
              Dismiss
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}
