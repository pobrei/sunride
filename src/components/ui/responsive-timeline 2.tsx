'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface TimelineItem {
  id: string;
  time: string;
  label: string;
  value?: string | number;
  unit?: string;
  color?: string;
  icon?: React.ReactNode;
  data?: Record<string, any>;
}

interface ResponsiveTimelineProps {
  /** Timeline items */
  items: TimelineItem[];
  /** Optional className for styling */
  className?: string;
  /** Timeline title */
  title?: string;
  /** Timeline description */
  description?: string;
  /** Timeline height */
  height?: 'auto' | 'sm' | 'md' | 'lg' | number;
  /** Whether to add a border to the timeline */
  bordered?: boolean;
  /** Whether to add a shadow to the timeline */
  shadowed?: boolean;
  /** Whether to add a rounded corner to the timeline */
  rounded?: boolean;
  /** Whether to add a background color to the timeline */
  background?: boolean;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to add padding to the timeline */
  padding?: boolean;
  /** Whether to show a loading state */
  loading?: boolean;
  /** Whether to show time labels */
  showTimeLabels?: boolean;
  /** Whether to show item values */
  showValues?: boolean;
  /** Whether to show item icons */
  showIcons?: boolean;
  /** Whether to highlight the selected item */
  selectedItemId?: string;
  /** Callback when an item is clicked */
  onItemClick?: (item: TimelineItem) => void;
}

/**
 * A responsive timeline component that follows iOS 19 design principles
 */
export function ResponsiveTimeline({
  items,
  className,
  title,
  description,
  height = 'md',
  bordered = true,
  shadowed = true,
  rounded = true,
  background = true,
  glass = false,
  padding = true,
  loading = false,
  showTimeLabels = true,
  showValues = true,
  showIcons = true,
  selectedItemId,
  onItemClick,
}: ResponsiveTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  
  // Map height to Tailwind classes or pixel values
  const getHeightClass = () => {
    if (typeof height === 'number') {
      return `h-[${height}px]`;
    }
    
    const heightClasses = {
      auto: 'h-auto',
      sm: 'h-[120px] sm:h-[140px]',
      md: 'h-[160px] sm:h-[180px]',
      lg: 'h-[200px] sm:h-[220px]',
    };
    
    return heightClasses[height];
  };
  
  // Check if timeline is scrollable
  useEffect(() => {
    if (!timelineRef.current) return;
    
    const checkScrollable = () => {
      if (timelineRef.current) {
        setIsScrollable(timelineRef.current.scrollWidth > timelineRef.current.clientWidth);
      }
    };
    
    // Initial check
    checkScrollable();
    
    // Add resize listener
    window.addEventListener('resize', checkScrollable);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScrollable);
    };
  }, [items]);
  
  return (
    <Card
      className={cn(
        'overflow-hidden',
        getHeightClass(),
        className
      )}
      variant={background ? (glass ? 'glass' : 'default') : 'ghost'}
      size={padding ? 'default' : 'none'}
      hover="none"
      rounded={rounded ? 'lg' : 'none'}
      glass={glass}
      interactive={false}
    >
      {(title || description) && (
        <div className="flex flex-col mb-2">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="relative">
          {isScrollable && (
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent z-10" />
          )}
          
          <div
            ref={timelineRef}
            className="flex overflow-x-auto scrollbar-thin pb-2"
          >
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex-shrink-0 min-w-[80px] px-2 flex flex-col items-center',
                  selectedItemId === item.id && 'bg-primary/10 rounded-md',
                  onItemClick && 'cursor-pointer hover:bg-muted/50 rounded-md transition-colors duration-200'
                )}
                onClick={() => onItemClick?.(item)}
              >
                {showIcons && item.icon && (
                  <div className="mb-1">{item.icon}</div>
                )}
                
                {showValues && (
                  <div className={cn(
                    'text-base font-medium',
                    item.color ? `text-${item.color}` : 'text-foreground'
                  )}>
                    {item.value}{item.unit}
                  </div>
                )}
                
                <div className="text-sm font-medium">{item.label}</div>
                
                {showTimeLabels && (
                  <div className="text-xs text-muted-foreground">{item.time}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default ResponsiveTimeline;
