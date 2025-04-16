'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Dynamically import the client-side component with no SSR
const HomeClient = dynamic(() => import('./page-client'), {
  ssr: false,
  loading: () => <Loading />
});

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeClient />
    </Suspense>
  );
}
