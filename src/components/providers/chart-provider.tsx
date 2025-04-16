'use client';

import React, { ReactNode, useEffect } from 'react';
import { setupChartDefaults } from '@/lib/chart-defaults';

interface ChartProviderProps {
  children: ReactNode;
}

export function ChartProvider({ children }: ChartProviderProps) {
  useEffect(() => {
    // Set up Chart.js defaults
    setupChartDefaults();
  }, []);

  return <>{children}</>;
}
