'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { responsive } from '@/styles/tailwind-utils';
import BaseChart from './BaseChart';

interface ChartCardProps {
  title: string;
  unitLabel?: string;
  children: React.ReactNode;
  className?: string;
  /**
   * Animation delay in seconds
   * @default 0
   */
  delay?: number;
}

/**
 * A reusable card component for charts
 */
const ChartCard: React.FC<ChartCardProps> = ({
  title,
  unitLabel,
  children,
  className,
  delay = 0
}) => {
  return (
    <BaseChart
      title={title}
      unitLabel={unitLabel}
      className={className}
    >
      {children}
    </BaseChart>
  );
};

export default ChartCard;
