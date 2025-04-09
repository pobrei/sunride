'use client';

import React, { ReactNode, useEffect } from 'react';
import { WeatherProvider } from '@/context/WeatherContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { NotificationProvider } from '@/components/NotificationProvider';
import { initSentry } from '@/lib/sentry';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // Initialize Sentry on the client side
  useEffect(() => {
    initSentry();
  }, []);

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <WeatherProvider>
          {children}
        </WeatherProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}
