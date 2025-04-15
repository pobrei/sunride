'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { classNames } from '@/utils/classNames';

interface LoadingSkeletonProps {
  /** Type of skeleton to display */
  type?: 'card' | 'list' | 'table' | 'text' | 'image' | 'chart';
  /** Number of items to display */
  count?: number;
  /** Optional className for styling */
  className?: string;
  /** Height of the skeleton */
  height?: string;
  /** Width of the skeleton */
  width?: string;
}

/**
 * A reusable skeleton loading component
 */
export function LoadingSkeleton({
  type = 'card',
  count = 1,
  className,
  height,
  width,
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={classNames('space-y-3', className)}>
            <Skeleton className={classNames('h-40 w-full rounded-lg', height, width)} />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        );
      case 'list':
        return (
          <div className={classNames('space-y-3', className)}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        );
      case 'table':
        return (
          <div className={classNames('space-y-3', className)}>
            <div className="flex space-x-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-8 w-1/4" />
            </div>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            ))}
          </div>
        );
      case 'text':
        return (
          <div className={classNames('space-y-2', className)}>
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className={classNames('h-4 w-full', height, width)} />
            ))}
          </div>
        );
      case 'image':
        return (
          <Skeleton className={classNames('h-48 w-full rounded-lg', height, width, className)} />
        );
      case 'chart':
        return (
          <div className={classNames('space-y-3', className)}>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className={classNames('h-64 w-full rounded-lg', height, width)} />
          </div>
        );
      default:
        return <Skeleton className={classNames('h-16 w-full', height, width, className)} />;
    }
  };

  return <div data-testid="loading-skeleton">{renderSkeleton()}</div>;
}
