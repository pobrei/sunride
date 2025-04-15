'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@frontend/components/ui/alert';
import { Button } from '@frontend/components/ui/button';

interface OfflineDetectorProps {
  /** Children to render when online */
  children: React.ReactNode;
  /** Whether to show a full-page offline message */
  fullPage?: boolean;
  /** Custom offline message */
  offlineMessage?: string;
  /** Custom retry button text */
  retryText?: string;
}

/**
 * Component that detects offline status and shows an appropriate message
 */
export function OfflineDetector({
  children,
  fullPage = false,
  offlineMessage = 'You are currently offline. Some features may not work properly.',
  retryText = 'Check Connection',
}: OfflineDetectorProps) {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Update online status when it changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Set initial state
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to manually check connection
  const checkConnection = () => {
    setIsOnline(navigator.onLine);
  };

  // If online, render children
  if (isOnline) {
    return <>{children}</>;
  }

  // If offline and fullPage is true, render a full-page message
  if (fullPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md p-6 rounded-xl bg-card shadow-lg border border-border">
          <div className="text-center mb-6">
            <WifiOff className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">You're Offline</h2>
            <p className="text-muted-foreground mb-4">{offlineMessage}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={checkConnection}
              className="w-full flex items-center justify-center gap-2"
            >
              <Wifi className="h-4 w-4" />
              {retryText}
            </Button>
            <div className="text-xs text-muted-foreground mt-4">
              <p>While offline, you can still:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>View previously loaded data</li>
                <li>Use basic app features</li>
                <li>Prepare routes for when you're back online</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If offline and fullPage is false, render an alert
  return (
    <div className="space-y-4">
      <Alert variant="warning" className="mb-4">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>You're Offline</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{offlineMessage}</p>
          <Button variant="outline" size="sm" className="w-fit mt-2" onClick={checkConnection}>
            <Wifi className="h-3 w-3 mr-2" />
            {retryText}
          </Button>
        </AlertDescription>
      </Alert>
      {children}
    </div>
  );
}
