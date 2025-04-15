'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { typography, layout, effects } from '@/styles/tailwind-utils';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
    <div className={cn(layout.flexCenter, "min-h-screen p-4 bg-background")}>
      <Card className="w-full max-w-md" variant="elevated">
        <CardHeader>
          <div className={cn(layout.flexCenter, "mb-2")}>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <CardTitle className={cn(typography.h3, "text-center")}>Something went wrong</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className={cn(typography.bodySm, typography.muted, "text-center")}>
            We encountered an issue while loading the application data.
          </p>

          {error && (
            <Alert variant="destructive" className="overflow-auto max-h-32">
              <AlertDescription className="font-mono text-xs">
                {error.message || 'Unknown error'}
              </AlertDescription>
            </Alert>
          )}

          <div className={cn(typography.bodySm, typography.muted, "mt-4")}>
            <p>If the problem persists, please try the following:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Clear your browser cache</li>
              <li>Try uploading a different GPX file</li>
              <li>Check your internet connection</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button onClick={handleReset} className="w-full" leftIcon={<RefreshCw className="h-4 w-4" />}>
            Try Again
          </Button>
          <Button onClick={handleGoHome} variant="outline" className="w-full" leftIcon={<Home className="h-4 w-4" />}>
            Go to Home Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FallbackUI;
