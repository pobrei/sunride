// Export map components
export { default as MapWrapper } from './MapWrapper';
export { default as SimpleLeafletMap } from './SimpleLeafletMap';

// Create a dynamic map component
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Dynamically import the MapWrapper component with no SSR
export const DynamicMap = dynamic(() => import('./MapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <LoadingSpinner message="Loading map..." centered variant="spinner" size="lg" />
    </div>
  ),
});
