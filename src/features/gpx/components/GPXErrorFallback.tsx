'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileX, RefreshCw, Upload, AlertTriangle } from 'lucide-react';
import { useSimpleNotifications } from '@/features/notifications/context';

interface GPXErrorFallbackProps {
  /** Error message to display */
  error?: Error | string | null;
  /** Function to retry with a new file */
  onRetry?: () => void;
  /** Whether the component should take up the full container */
  fullSize?: boolean;
  /** Title to display */
  title?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Fallback UI component for GPX file parsing failures
 */
export function GPXErrorFallback({
  error,
  onRetry,
  fullSize = false,
  title = 'GPX File Error',
  className = '',
}: GPXErrorFallbackProps) {
  // Try to use notifications context, but don't crash if it's not available
  let notificationContext;
  try {
    notificationContext = useSimpleNotifications();
  } catch (e) {
    // If context is not available, provide a fallback
    notificationContext = {
      addNotification: (type: string, message: string) => {
        console.log(`[Notification] ${type}: ${message}`);
        return '';
      },
    };
  }

  const { addNotification } = notificationContext;

  // Extract error message
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unable to process GPX file';

  // Handle retry
  const handleRetry = () => {
    if (onRetry) {
      addNotification('info', 'Please select a new GPX file');
      onRetry();
    }
  };

  return (
    <Card className={`${fullSize ? 'w-full h-full' : ''} ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <FileX className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <p className="text-muted-foreground mb-2">{errorMessage}</p>
          <div className="text-xs text-muted-foreground mt-2">
            <p>Common GPX file issues:</p>
            <ul className="list-disc pl-5 mt-1 text-left">
              <li>File is not a valid GPX format</li>
              <li>File is corrupted or incomplete</li>
              <li>File contains no track or route points</li>
              <li>File has invalid coordinates</li>
            </ul>
          </div>
        </div>
      </CardContent>

      {onRetry && (
        <CardFooter className="pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleRetry}
          >
            <Upload className="h-4 w-4" />
            Upload a Different File
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Smaller version of the fallback UI for use in widgets
 */
export function GPXWidgetFallback({
  onRetry,
  error,
}: {
  onRetry?: () => void;
  error?: Error | string | null;
}) {
  return (
    <div className="p-3 bg-muted/50 rounded-md flex flex-col items-center justify-center text-center min-h-[100px]">
      <FileX className="h-5 w-5 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground mb-2">
        {error instanceof Error ? error.message : error || 'GPX file error'}
      </p>
      {onRetry && (
        <Button variant="ghost" size="sm" className="mt-1" onClick={onRetry}>
          <Upload className="h-3 w-3 mr-1" />
          Try Another File
        </Button>
      )}
    </div>
  );
}
