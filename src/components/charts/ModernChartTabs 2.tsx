'use client';

/**
 * ModernChartTabs Component
 * 
 * This component provides a tabbed interface for displaying different charts
 * following iOS 19 design principles.
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Cloud, 
  Gauge, 
  Mountain, 
  Sun 
} from 'lucide-react';

interface ModernChartTabsProps {
  /** Children components (chart content) */
  children: React.ReactNode;
  /** Default selected tab */
  defaultTab?: string;
  /** Additional class names */
  className?: string;
  /** Whether to show a glass effect */
  glass?: boolean;
  /** Whether to show a border */
  bordered?: boolean;
  /** Whether to show a shadow */
  shadowed?: boolean;
  /** Whether to show rounded corners */
  rounded?: boolean;
  /** Whether to show icons in tabs */
  showIcons?: boolean;
  /** Whether to show a sticky header */
  stickyHeader?: boolean;
  /** Available tabs */
  availableTabs?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

/**
 * A modern chart tabs component that follows iOS 19 design principles
 */
export function ModernChartTabs({
  children,
  defaultTab = 'temperature',
  className,
  glass = true,
  bordered = true,
  shadowed = true,
  rounded = true,
  showIcons = true,
  stickyHeader = false,
  availableTabs,
}: ModernChartTabsProps) {
  // Default tabs if not provided
  const defaultTabs = [
    { id: 'temperature', label: 'Temperature', icon: <Thermometer className="h-3.5 w-3.5" /> },
    { id: 'precipitation', label: 'Precipitation', icon: <Droplets className="h-3.5 w-3.5" /> },
    { id: 'wind', label: 'Wind', icon: <Wind className="h-3.5 w-3.5" /> },
    { id: 'humidity', label: 'Humidity', icon: <Cloud className="h-3.5 w-3.5" /> },
    { id: 'pressure', label: 'Pressure', icon: <Gauge className="h-3.5 w-3.5" /> },
    { id: 'elevation', label: 'Elevation', icon: <Mountain className="h-3.5 w-3.5" /> },
    { id: 'uv-index', label: 'UV Index', icon: <Sun className="h-3.5 w-3.5" /> },
  ];

  const tabs = availableTabs || defaultTabs;

  return (
    <Card
      className={cn(
        'overflow-hidden animate-fade-in',
        {
          'border border-border/20': bordered,
          'shadow-sm': shadowed,
          'rounded-xl': rounded,
        },
        className
      )}
      variant={glass ? 'glass' : 'default'}
    >
      <Tabs defaultValue={defaultTab} className="w-full h-full">
        <TabsList 
          className={cn(
            "mb-2 flex flex-nowrap overflow-x-auto px-2 py-1.5 rounded-md border border-border/30 backdrop-blur-sm",
            "scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent",
            "bg-card/80 dark:bg-card/80",
            stickyHeader && "sticky top-0 z-10"
          )}
        >
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className="text-[10px] sm:text-xs py-1 px-1.5 sm:px-2 whitespace-nowrap"
            >
              {showIcons && tab.icon && (
                <span className="mr-1.5">{tab.icon}</span>
              )}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Render children (TabsContent elements) */}
        {children}
      </Tabs>
    </Card>
  );
}

/**
 * ModernChartTabContent Component
 * 
 * This component provides a consistent content container for chart tabs
 */
export function ModernChartTabContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContent 
      value={value} 
      className={cn(
        "mt-0 bg-transparent overflow-visible w-full h-[calc(100%-48px)]",
        className
      )}
    >
      {children}
    </TabsContent>
  );
}

export default ModernChartTabs;
