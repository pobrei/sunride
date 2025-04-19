// Export map components
export { default as MapWrapper } from './MapWrapper';
export { default as SimpleLeafletMap } from './SimpleLeafletMap';

// Create a dynamic map component
import dynamic from 'next/dynamic';
import { SimpleLoader } from '@/components/ui/SimpleLoader';

// Dynamically import the MapWrapper component with no SSR
export const DynamicMap = dynamic(() => import('./MapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <SimpleLoader />
        <p className="text-sm text-muted-foreground font-medium mt-2">Loading map...</p>
      </div>
    </div>
  ),
});
