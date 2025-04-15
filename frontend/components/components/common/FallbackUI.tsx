'use client';

import React from 'react';
import { Button } from '@frontend/components/ui/button';
import { useRouter } from 'next/navigation';

interface FallbackUIProps {
  error?: Error | null;
  resetErrorBoundary?: () => void;
}

const FallbackUI: React.FC<FallbackUIProps> = ({ error, resetErrorBoundary }) => {
  const router = useRouter();

  const handleReset = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      // If no reset function is provided, refresh the page
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md p-6 rounded-xl bg-card shadow-lg border border-border">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            We encountered an issue while loading the application data.
          </p>
          {error && (
            <div className="p-3 bg-destructive/10 rounded-md text-sm text-destructive mb-4 overflow-auto max-h-32">
              <p className="font-mono">{error.message || 'Unknown error'}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleReset} className="w-full">
            Try Again
          </Button>
          <Button onClick={handleGoHome} variant="outline" className="w-full">
            Go to Home Page
          </Button>
          <div className="text-xs text-muted-foreground mt-4">
            <p>If the problem persists, please try the following:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Clear your browser cache</li>
              <li>Try uploading a different GPX file</li>
              <li>Check your internet connection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallbackUI;
