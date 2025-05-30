'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import { SimpleLoader } from '@/components/ui/SimpleLoader';

// Loading component with train design
const Loading = () => (
  <div className="flex flex-col items-center justify-center h-screen gap-4">
    <SimpleLoader />
    <p className="text-lg font-medium">Loading SunRide...</p>
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
