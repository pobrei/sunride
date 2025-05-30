'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DataItem {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  trendLabel?: string;
}

interface DataCardProps {
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Data items to display */
  items: DataItem[];
  /** Optional className for styling */
  className?: string;
  /** Layout of the data items */
  layout?: 'grid' | 'list' | 'inline';
  /** Number of columns in grid layout */
  columns?: 1 | 2 | 3 | 4;
  /** Whether to add a border to the card */
  bordered?: boolean;
  /** Whether to add a shadow to the card */
  shadowed?: boolean;
  /** Whether to add a rounded corner to the card */
  rounded?: boolean;
  /** Whether to add a background color to the card */
  background?: boolean;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to show icons */
  showIcons?: boolean;
  /** Whether to show trends */
  showTrends?: boolean;
  /** Whether to show a loading state */
  loading?: boolean;
}

/**
 * A data card component that follows iOS 19 design principles
 */
export function DataCard({
  title,
  description,
  items,
  className,
  layout = 'grid',
  columns = 2,
  bordered = true,
  shadowed = true,
  rounded = true,
  background = true,
  glass = false,
  showIcons = true,
  showTrends = true,
  loading = false,
}: DataCardProps) {
  // Get layout classes
  const getLayoutClasses = () => {
    if (layout === 'inline') {
      return 'flex flex-row flex-wrap gap-4';
    }
    
    if (layout === 'list') {
      return 'flex flex-col gap-3';
    }
    
    // Grid layout
    const gridClasses = {
      1: 'grid grid-cols-1 gap-4',
      2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
      3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
      4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
    };
    
    return gridClasses[columns];
  };
  
  // Render trend indicator
  const renderTrend = (trend: 'up' | 'down' | 'neutral', value?: string | number, label?: string) => {
    const trendColors = {
      up: 'text-success',
      down: 'text-destructive',
      neutral: 'text-muted-foreground',
    };
    
    const trendIcons = {
      up: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="m18 15-6-6-6 6"/>
        </svg>
      ),
      down: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      ),
      neutral: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="M5 12h14"/>
        </svg>
      ),
    };
    
    return (
      <div className={cn('flex items-center text-xs', trendColors[trend])}>
        {trendIcons[trend]}
        {value && <span className="mr-1">{value}</span>}
        {label && <span className="text-muted-foreground">{label}</span>}
      </div>
    );
  };
  
  return (
    <Card
      className={cn('overflow-hidden', className)}
      variant={background ? (glass ? 'glass' : 'default') : 'ghost'}
      hover="none"
      rounded={rounded ? 'lg' : 'none'}
      glass={glass}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      
      <CardContent>
        {loading ? (
          <div className="w-full flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className={getLayoutClasses()}>
            {items.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'flex flex-col',
                  layout === 'inline' && 'min-w-[120px]',
                  layout === 'list' && 'flex-row items-center justify-between'
                )}
              >
                <div className={cn(
                  'flex items-center gap-2 text-sm text-muted-foreground mb-1',
                  layout === 'list' && 'mb-0'
                )}>
                  {showIcons && item.icon && (
                    <span>{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </div>
                
                <div className={cn(
                  'flex flex-col',
                  layout === 'list' && 'items-end'
                )}>
                  <div className={cn(
                    'text-lg font-semibold',
                    item.color && `text-${item.color}`
                  )}>
                    {item.value}{item.unit && <span className="text-sm font-normal ml-0.5">{item.unit}</span>}
                  </div>
                  
                  {showTrends && item.trend && (
                    renderTrend(item.trend, item.trendValue, item.trendLabel)
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DataCard;
