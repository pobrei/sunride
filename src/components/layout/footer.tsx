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
        'w-full border-t border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-4 mt-auto', /* Changed from fixed to mt-auto for proper spacing */
        animation.fadeIn,
        className
      )}
    >
      <div className={cn(layout.container)}>
        <div className={cn(layout.flexBetween, 'md:flex-row gap-2')}>
          <div className={cn(layout.flexRow, 'gap-2')}>
            <Link href="/" className={cn(layout.flexRow, 'gap-2', animation.linkHover)}>
              <span className="text-sm font-semibold text-zinc-800 dark:text-white">SunRide</span>
            </Link>
            <span className="text-zinc-400 dark:text-zinc-500">|</span>
            <a
              href="https://github.com/pobrei/sunride"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4 inline-block mr-1" />
              GitHub
            </a>
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            &copy; {currentYear} SunRide. Made with <Heart className="inline-block h-3 w-3 text-red-500" /> by Pobrei
          </p>
        </div>
      </div>
    </footer>
  );
}
