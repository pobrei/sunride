'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  unitLabel?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A reusable card component for charts
 */
const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  unitLabel, 
  children, 
  className 
}) => {
  return (
    <Card className={cn("overflow-hidden bg-white dark:bg-[var(--color-card)] rounded-2xl", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-[#1E2A38] dark:text-[#F5F7FA]">
            {title}
          </CardTitle>
          {unitLabel && (
            <span className="text-sm text-[#1E2A38]/70 dark:text-[#F5F7FA]/70">
              {unitLabel}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
