'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CloudRain, ChevronLeft, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener to detect when page is scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <motion.header
      className={cn(
        'sticky top-0 z-[100] bg-white/80 dark:bg-[#1E2A38]/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b transition-all duration-300',
        scrolled ? 'border-[#E5E7EB]/50 dark:border-[#2D3748]/50 shadow-[0_2px_5px_rgba(0,0,0,0.08)]' : 'border-transparent shadow-none',
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(layout.flexRow, 'gap-2')}>
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5 text-[#1A1A1A] dark:text-white" />
          </Button>
        )}
        <Link href="/" className={cn(layout.flexRow, 'gap-2 hover:opacity-90 transition-all duration-200')}>
          <motion.div
            className={cn(
              layout.flexCenter,
              'w-9 h-9 bg-gradient-to-br from-[#00C2A8] to-[#00A896] text-white rounded-xl flex items-center justify-center shadow-sm'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>
          <motion.span
            className={cn('text-lg font-medium tracking-tight hidden sm:inline-block text-[#1A1A1A] dark:text-white')}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {title || 'SunRide'}
          </motion.span>
        </Link>
      </div>

      {/* Right side of header - can be extended with additional elements */}
      <div className={cn(layout.flexRow, 'gap-3')}>
        {/* Placeholder for optional elements */}
      </div>
    </motion.header>
  );
}
