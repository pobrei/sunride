'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { classNames } from '@/utils/classNames';

interface ErrorCardProps {
  /** Error title */
  title?: string;
  /** Error message */
  message: string;
  /** Optional retry function */
  onRetry?: () => void;
  /** Optional retry button text */
  retryText?: string;
  /** Optional home button function */
  onHome?: () => void;
  /** Optional home button text */
  homeText?: string;
  /** Optional className for styling */
  className?: string;
  /** Height of the card */
  height?: string;
}

/**
 * A card displaying an error message with optional retry button
 */
export function ErrorCard({
  title = 'Error',
  message,
  onRetry,
  retryText = 'Try Again',
  onHome,
  homeText = 'Go Home',
  className,
  height = 'h-64',
}: ErrorCardProps) {
  return (
    <Card className={classNames('w-full', height, className)} data-testid="error-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
      {(onRetry || onHome) && (
        <CardFooter className="flex gap-2 justify-start">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={onRetry}
            >
              <RefreshCw className="h-4 w-4" />
              {retryText}
            </Button>
          )}
          {onHome && (
            <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={onHome}>
              <Home className="h-4 w-4" />
              {homeText}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
