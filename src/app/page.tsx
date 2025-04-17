'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading component with improved animation
const Loading = () => (
  <div className="flex flex-col items-center justify-center h-screen gap-4">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
    </div>
    <div className="text-primary font-medium animate-pulse">Loading SunRide...</div>
  </div>
);

// Dynamically import the enhanced client-side component with no SSR
const HomeClient = dynamic(() => import('./page-client-enhanced'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeClient />
    </Suspense>
  );
}
