'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AsyncStateHandlerProps<T> {
  /** The data to render */
  data: T | null;
  /** Whether the data is loading */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Function to render the data */
  children: (data: T) => React.ReactNode;
  /** Function to retry loading the data */
  onRetry?: () => void;
  /** Loading component to show while loading */
  loadingComponent?: React.ReactNode;
  /** Error component to show when an error occurs */
  errorComponent?: React.ReactNode;
  /** Whether to show a skeleton while loading */
  showSkeleton?: boolean;
  /** Number of skeleton items to show */
  skeletonCount?: number;
  /** Height of each skeleton item */
  skeletonHeight?: string;
}

/**
 * Component that handles async state (loading, error, data) with appropriate UI
 */
export function AsyncStateHandler<T>({
  data,
  isLoading,
  error,
  children,
  onRetry,
  loadingComponent,
  errorComponent,
  showSkeleton = true,
  skeletonCount = 3,
  skeletonHeight = 'h-16',
}: AsyncStateHandlerProps<T>) {
  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    if (showSkeleton) {
      return (
        <div className="space-y-3">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <Skeleton key={i} className={`w-full ${skeletonHeight}`} />
          ))}
        </div>
      );
    }

    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error state
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{error.message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" className="w-fit mt-2" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Show empty state
  if (!data) {
    return (
      <Alert className="mb-4">
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          No data is available to display.
          {onRetry && (
            <Button variant="outline" size="sm" className="w-fit mt-2" onClick={onRetry}>
              Refresh
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Render data
  return <>{children(data)}</>;
}
