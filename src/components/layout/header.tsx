'use client';

import React from 'react';
import Link from 'next/link';
import { CloudRain } from 'lucide-react';
// Dark mode toggle removed as requested

import { cn } from '@/lib/utils';
import { typography, animation, layout } from '@/styles/tailwind-utils';

interface HeaderProps {
  /** Optional className for styling */
  className?: string;
}

/**
 * The main header component for the application
 */
export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        animation.fadeIn,
        className
      )}
    >
      <div className={cn(layout.container, layout.flexBetween, 'h-16')}>
        <div className={cn(layout.flexRow, 'gap-2')}>
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
            <span className={cn(typography.h5, 'hidden sm:inline-block')}>SunRide</span>
          </Link>
        </div>

        {/* Dark mode toggle removed as requested */}
      </div>
    </header>
  );
}
