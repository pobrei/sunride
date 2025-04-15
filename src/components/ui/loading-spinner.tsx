'use client';

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  centered?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ message, centered = false, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  const spinner = (
    <div className={`relative ${centered ? 'flex flex-col items-center justify-center' : ''}`}>
      <div
        className={`animate-spin rounded-full border-t-transparent border-primary ${sizeClasses[size]}`}
      ></div>
      {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
    </div>
  );

  if (centered) {
    return <div className="flex items-center justify-center w-full h-full">{spinner}</div>;
  }

  return spinner;
}
