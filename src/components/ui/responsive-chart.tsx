'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface ResponsiveChartProps {
  /** Chart content */
  children: React.ReactNode;
  /** Optional className for styling */
  className?: string;
  /** Chart title */
  title?: string;
  /** Chart description */
  description?: string;
  /** Chart height */
  height?: 'auto' | 'sm' | 'md' | 'lg' | 'xl' | number;
  /** Whether to add a border to the chart */
  bordered?: boolean;
  /** Whether to add a shadow to the chart */
  shadowed?: boolean;
  /** Whether to add a rounded corner to the chart */
  rounded?: boolean;
  /** Whether to add a background color to the chart */
  background?: boolean;
  /** Whether to use a glass effect */
  glass?: boolean;
  /** Whether to add padding to the chart */
  padding?: boolean;
  /** Whether to make the chart responsive */
  responsive?: boolean;
  /** Whether to show a loading state */
  loading?: boolean;
}

/**
 * A responsive chart component that follows iOS 19 design principles
 */
export function ResponsiveChart({
  children,
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
  responsive = true,
  loading = false,
}: ResponsiveChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState<number | null>(null);
  
  // Map height to Tailwind classes or pixel values
  const getHeightClass = () => {
    if (typeof height === 'number') {
      return `h-[${height}px]`;
    }
    
    const heightClasses = {
      auto: 'h-auto',
      sm: 'h-[200px] sm:h-[250px] md:h-[300px]',
      md: 'h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]',
      lg: 'h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px]',
      xl: 'h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px]',
    };
    
    return heightClasses[height];
  };
  
  // Update chart width on resize
  useEffect(() => {
    if (!responsive || !chartRef.current) return;
    
    const updateWidth = () => {
      if (chartRef.current) {
        setChartWidth(chartRef.current.clientWidth);
      }
    };
    
    // Initial width
    updateWidth();
    
    // Add resize listener
    window.addEventListener('resize', updateWidth);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [responsive]);
  
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
      
      <div
        ref={chartRef}
        className={cn(
          'w-full h-full',
          loading && 'animate-pulse'
        )}
      >
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          responsive ? (
            React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return child;
              
              // Pass width to chart component
              return React.cloneElement(child, {
                ...child.props,
                width: chartWidth,
              });
            })
          ) : (
            children
          )
        )}
      </div>
    </Card>
  );
}

export default ResponsiveChart;
