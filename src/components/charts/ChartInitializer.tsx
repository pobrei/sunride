'use client';

import { useEffect } from 'react';
import { initializeChartDefaults } from '@/lib/chart-init';

/**
 * A component that initializes Chart.js defaults
 * This is kept for backward compatibility
 */
export const ChartInitializer = () => {
  useEffect(() => {
    console.log('Chart.js initialized by ChartInitializer');
    initializeChartDefaults();
  }, []);

  return null;
};
