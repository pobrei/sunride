'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { LoadingSpinner } from './LoadingSpinner';
import { classNames } from '@shared/utils/classNames';

interface LoadingCardProps {
  /** Title of the card */
  title?: string;
  /** Message to display */
  message?: string;
  /** Optional className for styling */
  className?: string;
  /** Height of the card */
  height?: string;
}

/**
 * A card with a loading spinner
 */
export function LoadingCard({
  title = 'Loading',
  message = 'Please wait while we load the data...',
  className,
  height = 'h-64',
}: LoadingCardProps) {
  return (
    <Card className={classNames('w-full', height, className)}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex items-center justify-center h-full">
        <LoadingSpinner message={message} centered />
      </CardContent>
    </Card>
  );
}
