'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BaseCardProps {
  /** Card title */
  title?: string;
  /** Optional subtitle or unit label */
  subtitle?: string;
  /** Card content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Optional header content */
  headerContent?: React.ReactNode;
  /** Optional footer content */
  footerContent?: React.ReactNode;
  /** Whether to add padding to the content */
  withPadding?: boolean;
}

/**
 * Base card component that provides consistent styling across the app
 */
const BaseCard: React.FC<BaseCardProps> = ({
  title,
  subtitle,
  children,
  className,
  headerContent,
  footerContent,
  withPadding = true,
}) => {
  return (
    <div className={cn("w-full max-w-full rounded-lg overflow-hidden bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700", className)}>
      {(title || subtitle || headerContent) && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700">
          <div className="flex flex-col">
            {title && <h2 className="text-sm sm:text-base font-semibold text-zinc-800 dark:text-white">{title}</h2>}
            {subtitle && <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{subtitle}</span>}
          </div>
          {headerContent && <div>{headerContent}</div>}
        </div>
      )}
      <div className={cn(withPadding && "p-4", "bg-white dark:bg-zinc-800")}>
        {children}
      </div>
      {footerContent && (
        <div className="p-4 bg-white dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700">
          {footerContent}
        </div>
      )}
    </div>
  );
};

export { BaseCard };
