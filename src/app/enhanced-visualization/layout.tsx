import type { Metadata } from 'next';
import { WeatherProvider } from '@/features/weather/context';

export const metadata: Metadata = {
  title: 'Enhanced Visualization - SunRide',
  description: 'Advanced visualization of your cycling routes with detailed weather and elevation data',
};

export default function EnhancedVisualizationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WeatherProvider>
      {children}
    </WeatherProvider>
  );
}
