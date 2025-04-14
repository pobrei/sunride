'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show a pulse animation */
  pulse?: boolean;
  /** Whether to show a shimmer animation */
  shimmer?: boolean;
  /** Whether to show a rounded shape */
  rounded?: boolean;
  /** Whether to show a circle shape */
  circle?: boolean;
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
}

/**
 * A skeleton loading component
 */
export function Skeleton({
  className,
  pulse = true,
  shimmer = false,
  rounded = false,
  circle = false,
  width,
  height,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-muted/60 dark:bg-muted/40',
        pulse && 'animate-pulse',
        shimmer && 'animate-shimmer',
        rounded && 'rounded-md',
        circle && 'rounded-full',
        className
      )}
      style={{
        width: width,
        height: height,
      }}
      {...props}
    />
  );
}

/**
 * A skeleton text component
 */
export function SkeletonText({
  className,
  lines = 1,
  lastLineWidth = '100%',
  ...props
}: SkeletonProps & { lines?: number; lastLineWidth?: string | number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4 rounded',
            i === lines - 1 && typeof lastLineWidth === 'string' ? '' : '',
            className
          )}
          style={{
            width: i === lines - 1 ? lastLineWidth : '100%',
          }}
          {...props}
        />
      ))}
    </div>
  );
}

/**
 * A skeleton card component
 */
export function SkeletonCard({
  className,
  header = true,
  headerHeight = 'h-8',
  content = true,
  contentLines = 3,
  footer = false,
  footerHeight = 'h-10',
  ...props
}: SkeletonProps & {
  header?: boolean;
  headerHeight?: string;
  content?: boolean;
  contentLines?: number;
  footer?: boolean;
  footerHeight?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card overflow-hidden',
        className
      )}
      {...props}
    >
      {header && (
        <div className="p-4 border-b border-border">
          <Skeleton className={cn('rounded', headerHeight)} />
        </div>
      )}
      {content && (
        <div className="p-4">
          <SkeletonText lines={contentLines} />
        </div>
      )}
      {footer && (
        <div className="p-4 border-t border-border">
          <Skeleton className={cn('rounded', footerHeight)} />
        </div>
      )}
    </div>
  );
}
