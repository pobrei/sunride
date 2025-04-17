'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { responsive } from '@/styles/tailwind-utils';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay,
        ease: 'easeOut'
      }}
    >
      <Card className={cn("overflow-visible bg-white rounded-xl shadow-sm max-w-7xl mx-auto text-zinc-700 w-full", className)}>
        <CardHeader className="pb-2">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.1, duration: 0.3 }}
          >
            <h2 className="text-sm font-medium text-zinc-500 mb-2">{title}</h2>
            {unitLabel && (
              <span className="text-sm text-zinc-500">
                {unitLabel}
              </span>
            )}
          </motion.div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 overflow-visible">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.3 }}
          >
            {children}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChartCard;
