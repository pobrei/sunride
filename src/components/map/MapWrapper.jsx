'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Dynamically import the map component with no SSR
const DynamicMap = dynamic(() => import('./SimpleLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <LoadingSpinner message="Loading map..." centered variant="spinner" size="lg" />
    </div>
  ),
});

/**
 * A wrapper component for the map that handles dynamic loading
 */
export default function MapWrapper(props) {
  return <DynamicMap {...props} />;
}
