'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CloudRain, ChevronLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { typography, animation, layout } from '@/styles/tailwind-utils';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  /** Optional className for styling */
  className?: string;
  /** Whether to show a back button */
  showBackButton?: boolean;
  /** Optional back URL override (defaults to browser history) */
  backUrl?: string;
  /** Optional title to display in the header */
  title?: string;
}

/**
 * The main header component for the application
 */
export function Header({ className, showBackButton = false, backUrl, title }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-white shadow-sm px-4 py-2 flex items-center justify-between',
        animation.fadeIn,
        className
      )}
    >
      <div className={cn(layout.flexRow, 'gap-2')}>
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-1"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <Link href="/" className={cn(layout.flexRow, 'gap-2', animation.linkHover)}>
          <div
            className={cn(
              layout.flexCenter,
              'w-8 h-8 rounded-full bg-primary/10',
              animation.pulse
            )}
          >
            <CloudRain className="h-5 w-5 text-primary" />
          </div>
          <span className={cn(typography.h5, 'hidden sm:inline-block')}>
            {title || 'SunRide'}
          </span>
        </Link>
      </div>

      {/* Right side of header - can be extended with additional elements */}
      <div className={cn(layout.flexRow, 'gap-2')}>
        {/* Placeholder for optional elements */}
      </div>
    </header>
  );
}
