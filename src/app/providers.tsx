'use client';

import React, { ReactNode, useEffect } from 'react';

// Import from feature folders
import { WeatherProvider } from '@/features/weather/context';
import { NotificationProvider, SimpleNotificationProvider } from '@/features/notifications/context';
import { SafeDataProvider } from '@/features/data-validation/context';

// Import from components
import { ErrorBoundary } from '@/components/common';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/ui/toast';

// Import from lib
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
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider>
          <NotificationProvider>
            <SimpleNotificationProvider>
              <SafeDataProvider>
                <WeatherProvider>
                  {children}
                </WeatherProvider>
              </SafeDataProvider>
            </SimpleNotificationProvider>
          </NotificationProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
