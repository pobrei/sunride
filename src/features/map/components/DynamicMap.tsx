'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { LoadingSpinner } from '@/components/ui';

// Dynamically import the OpenLayersMap component with no SSR
const DynamicOpenLayersMap = dynamic(() => import('./OpenLayersMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-muted flex items-center justify-center">
      <LoadingSpinner message="Loading map..." centered />
    </div>
  ),
});

export default DynamicOpenLayersMap;
