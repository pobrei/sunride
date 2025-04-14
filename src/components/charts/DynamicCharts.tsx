'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { LoadingSpinner } from '@/components/ui';

// Dynamically import the Charts component with no SSR
const DynamicCharts = dynamic(() => import('./Charts'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-muted flex items-center justify-center">
      <LoadingSpinner message="Loading charts..." centered />
    </div>
  ),
});

export default DynamicCharts;
