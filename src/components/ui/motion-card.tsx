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
 * A card component - Flat Design Version (no animations)
 */
export function MotionCard({
  children,
  className,
}: MotionCardProps) {
  return (
    <div className={className}>
      <Card className="h-full">{children}</Card>
    </div>
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
 * A card title - Flat Design Version (no animations)
 */
export function MotionCardTitle({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle className={cn(className)} {...props}>
      {children}
    </CardTitle>
  );
}

/**
 * A card description - Flat Design Version (no animations)
 */
export function MotionCardDescription({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CardDescription>) {
  return (
    <CardDescription className={cn(className)} {...props}>
      {children}
    </CardDescription>
  );
}

/**
 * A card content - Flat Design Version (no animations)
 */
export function MotionCardContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent className={cn(className)} {...props}>
      {children}
    </CardContent>
  );
}

/**
 * A card footer - Flat Design Version (no animations)
 */
export function MotionCardFooter({
  children,
  className,
  ...props
}: React.ComponentProps<typeof CardFooter>) {
  return (
    <CardFooter className={cn(className)} {...props}>
      {children}
    </CardFooter>
  );
}
