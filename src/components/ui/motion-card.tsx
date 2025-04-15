'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  hover?: boolean;
  delay?: number;
}

/**
 * A card component with motion animations
 */
export function MotionCard({
  children,
  className,
  animate = true,
  hover = true,
  delay = 0,
}: MotionCardProps) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : undefined}
      className={className}
    >
      <Card className="h-full">{children}</Card>
    </motion.div>
  );
}

/**
 * A motion-enhanced card header
 */
export function MotionCardHeader({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader className={cn(className)} {...props}>
      {children}
    </CardHeader>
  );
}

/**
 * A motion-enhanced card title
 */
export function MotionCardTitle({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle className={cn(className)} {...props}>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {children}
      </motion.span>
    </CardTitle>
  );
}

/**
 * A motion-enhanced card description
 */
export function MotionCardDescription({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CardDescription>) {
  return (
    <CardDescription className={cn(className)} {...props}>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {children}
      </motion.span>
    </CardDescription>
  );
}

/**
 * A motion-enhanced card content
 */
export function MotionCardContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent className={cn(className)} {...props}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {children}
      </motion.div>
    </CardContent>
  );
}

/**
 * A motion-enhanced card footer
 */
export function MotionCardFooter({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CardFooter>) {
  return (
    <CardFooter className={cn(className)} {...props}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        {children}
      </motion.div>
    </CardFooter>
  );
}
