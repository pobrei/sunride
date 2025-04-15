'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Import from components
import { LoadingSpinner } from '@frontend/components/ui';

// Dynamically import the Timeline component with no SSR
const DynamicTimeline = dynamic(() => import('./Timeline'), {
  ssr: false,
  loading: () => (
    <div className="h-[150px] bg-muted flex items-center justify-center">
      <LoadingSpinner message="Loading timeline..." centered />
    </div>
  ),
});

export default DynamicTimeline;
