'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Heart, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { typography, animation, effects, layout } from '@/styles/tailwind-utils';

interface FooterProps {
  /** Optional className for styling */
  className?: string;
}

/**
 * The main footer component for the application
 */
export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'w-full border-t border-border bg-white/90 dark:bg-card/80 backdrop-blur-sm py-6 mt-auto',
        className
      )}
    >
      <div className={cn(layout.container)}>
        <div className={cn('flex flex-col md:flex-row justify-between items-center gap-6')}>
          <div className={cn('flex items-center gap-5')}>
            <Link href="/" className={cn('flex items-center gap-2 hover:opacity-90 transition-all duration-200 hover:scale-[1.02]')}>
              <span className="text-sm font-semibold text-foreground">SunRide</span>
            </Link>
            <div className="h-4 w-px bg-border/60"></div>
            <a
              href="https://github.com/pobrei/sunride"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <Github className="h-4 w-4 inline-block mr-1" />
              GitHub
            </a>
          </div>

          <p className="text-sm text-muted-foreground text-center md:text-right">
            &copy; {currentYear} SunRide. Made with <Heart className="inline-block h-3.5 w-3.5 text-red-500 hover:animate-pulse transition-all duration-300" /> by Pobrei
          </p>
        </div>
      </div>
    </footer>
  );
}
