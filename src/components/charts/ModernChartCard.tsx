'use client';

/**
 * ModernChartCard Component
 * 
 * This component provides a consistent card container for charts
 * following iOS 19 design principles.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ModernChartCardProps {
  /** Chart title */
  title: string;
  /** Unit label (e.g., °C, mm, etc.) */
  unitLabel?: string;
  /** Optional description or tooltip content */
  description?: string;
  /** Children components (chart content) */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Card height */
  height?: string;
  /** Whether to show a loading state */
  loading?: boolean;
  /** Whether to use glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
}

/**
 * A modern chart card component that follows iOS 19 design principles
 */
export function ModernChartCard({
  title,
  unitLabel,
  description,
  children,
  className,
  height = 'h-[350px] sm:h-[380px] md:h-[410px] lg:h-[430px]',
  loading = false,
  glass = true,
  bordered = true,
  shadowed = true,
  rounded = true,
}: ModernChartCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden animate-fade-in',
        height,
        {
          'border border-border/20': bordered,
          'shadow-sm': shadowed,
          'rounded-xl': rounded,
        },
        className
      )}
      variant={glass ? 'glass' : 'default'}
    >
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {unitLabel && (
          <span className="text-sm font-medium text-muted-foreground">
            {unitLabel}
          </span>
        )}
      </CardHeader>
      
      <CardContent className="p-0 h-[calc(100%-60px)]">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-full w-full overflow-hidden">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default ModernChartCard;
