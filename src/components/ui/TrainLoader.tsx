'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TrainLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Train-themed loading component
 */
export const TrainLoader: React.FC<TrainLoaderProps> = ({
  size = 'md',
  message,
  ariaLabel = 'Loading',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn('relative flex items-center justify-center', sizeClasses[size])}
        role="status"
        aria-label={ariaLabel}
      >
        {/* Train body */}
        <div className="relative">
          <div className="w-full h-6 bg-primary rounded-lg animate-pulse">
            {/* Train windows */}
            <div className="flex justify-center items-center h-full gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>
            </div>
          </div>

          {/* Train wheels */}
          <div className="absolute -bottom-1 left-1 w-2 h-2 bg-muted-foreground rounded-full animate-spin"></div>
          <div className="absolute -bottom-1 right-1 w-2 h-2 bg-muted-foreground rounded-full animate-spin"></div>
        </div>
      </div>

      {message && (
        <p className={cn('text-muted-foreground font-medium animate-pulse', textSizeClasses[size])}>
          {message}
        </p>
      )}
    </div>
  );
};
