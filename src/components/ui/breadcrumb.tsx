'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** The segments of the breadcrumb */
  segments: {
    /** The label to display */
    label: string;
    /** The href for the segment */
    href?: string;
    /** Optional icon to display */
    icon?: React.ReactNode;
  }[];
  /** Whether to show the home icon */
  showHomeIcon?: boolean;
  /** Optional separator between segments */
  separator?: React.ReactNode;
}

/**
 * A breadcrumb component for navigation
 */
export function Breadcrumb({
  segments,
  showHomeIcon = true,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm text-muted-foreground', className)}
      {...props}
    >
      <ol className="flex items-center space-x-2">
        {showHomeIcon && (
          <li className="flex items-center">
            <Link
              href="/"
              className="flex items-center hover:text-foreground transition-colors"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
          </li>
        )}

        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <React.Fragment key={segment.label}>
              {(index > 0 || showHomeIcon) && (
                <li className="flex items-center" aria-hidden="true">
                  {separator}
                </li>
              )}
              <li className="flex items-center">
                {segment.href && !isLast ? (
                  <Link
                    href={segment.href}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    {segment.icon && <span className="mr-1">{segment.icon}</span>}
                    {segment.label}
                  </Link>
                ) : (
                  <span className={cn('flex items-center', isLast && 'font-medium text-foreground')}>
                    {segment.icon && <span className="mr-1">{segment.icon}</span>}
                    {segment.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
