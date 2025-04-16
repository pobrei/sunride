import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { MainNav } from '@frontend/components/layout';
import { SkipToContent } from '@frontend/components/ui';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RideWeather Planner',
  description: 'Plan your routes with detailed weather forecasts along the way',
  keywords: ['weather', 'planning', 'GPX', 'route', 'cycling', 'hiking', 'forecast'],
  authors: [{ name: 'Filipp Shamshin' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RideWeather',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#111' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              const theme = localStorage.getItem('theme') || 'system';
              const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              document.documentElement.classList.add(theme === 'system' ? systemTheme : theme);
            } catch (e) {
              console.error('Error applying theme:', e);
              document.documentElement.classList.add('dark');
            }
          })()
        `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <SkipToContent contentId="main-content" />
          <div className="relative flex min-h-screen flex-col container-transition">
            <MainNav />
            <main id="main-content" className="flex-1" tabIndex={-1} aria-label="Main content">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
