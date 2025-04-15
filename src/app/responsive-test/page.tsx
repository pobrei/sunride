'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMediaQuery } from '@/hooks';
import { cn } from '@/lib/utils';
import { typography, animation, effects, layout } from '@/styles/tailwind-utils';
import { usePerformance } from '@/components/providers/performance-provider';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { MotionCard } from '@/components/ui/motion-card';

export default function ResponsiveTestPage() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  
  const { 
    shouldReduceMotion,
    shouldReduceQuality,
    isReducedMotionPreferred,
    isHighContrastPreferred,
    supportsWebP,
    supportsAvif
  } = usePerformance();

  return (
    <PageWrapper>
      <div className={cn(layout.flexRow, "gap-2 mb-6", animation.fadeIn)}>
        <Button variant="outline" size="sm" asChild className={effects.buttonHover}>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <h1 className={cn(typography.h2)}>Responsive Design Test</h1>
      </div>

      <div className="space-y-8">
        {/* Device Detection */}
        <Card className={cn(effects.cardHoverable, animation.fadeIn)}>
          <CardHeader>
            <CardTitle>Device Detection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={cn(
                "p-4 rounded-lg border",
                isMobile ? "bg-primary/10 border-primary" : "bg-muted/30 border-border"
              )}>
                <p className={cn(typography.strong, "mb-1")}>Mobile</p>
                <p className={cn(typography.bodySm, typography.muted)}>
                  {isMobile ? "Currently on mobile device" : "Not on mobile device"}
                </p>
              </div>
              
              <div className={cn(
                "p-4 rounded-lg border",
                isTablet ? "bg-primary/10 border-primary" : "bg-muted/30 border-border"
              )}>
                <p className={cn(typography.strong, "mb-1")}>Tablet</p>
                <p className={cn(typography.bodySm, typography.muted)}>
                  {isTablet ? "Currently on tablet device" : "Not on tablet device"}
                </p>
              </div>
              
              <div className={cn(
                "p-4 rounded-lg border",
                isDesktop ? "bg-primary/10 border-primary" : "bg-muted/30 border-border"
              )}>
                <p className={cn(typography.strong, "mb-1")}>Desktop</p>
                <p className={cn(typography.bodySm, typography.muted)}>
                  {isDesktop ? "Currently on desktop device" : "Not on desktop device"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Features */}
        <Card className={cn(effects.cardHoverable, animation.fadeIn)}>
          <CardHeader>
            <CardTitle>Performance Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={cn(
                "p-4 rounded-lg border",
                shouldReduceMotion ? "bg-warning/10 border-warning" : "bg-success/10 border-success"
              )}>
                <p className={cn(typography.strong, "mb-1")}>Reduced Motion</p>
                <p className={cn(typography.bodySm, typography.muted)}>
                  {isReducedMotionPreferred 
                    ? "User prefers reduced motion" 
                    : "User has no motion preference"}
                </p>
              </div>
              
              <div className={cn(
                "p-4 rounded-lg border",
                shouldReduceQuality ? "bg-warning/10 border-warning" : "bg-success/10 border-success"
              )}>
                <p className={cn(typography.strong, "mb-1")}>Image Quality</p>
                <p className={cn(typography.bodySm, typography.muted)}>
                  {shouldReduceQuality 
                    ? "Using reduced quality images" 
                    : "Using high quality images"}
                </p>
              </div>
              
              <div className={cn(
                "p-4 rounded-lg border",
                isHighContrastPreferred ? "bg-info/10 border-info" : "bg-muted/30 border-border"
              )}>
                <p className={cn(typography.strong, "mb-1")}>High Contrast</p>
                <p className={cn(typography.bodySm, typography.muted)}>
                  {isHighContrastPreferred 
                    ? "User prefers high contrast" 
                    : "User has no contrast preference"}
                </p>
              </div>
              
              <div className={cn(
                "p-4 rounded-lg border",
                supportsWebP ? "bg-success/10 border-success" : "bg-warning/10 border-warning"
              )}>
                <p className={cn(typography.strong, "mb-1")}>Image Format Support</p>
                <p className={cn(typography.bodySm, typography.muted)}>
                  WebP: {supportsWebP ? "Supported" : "Not supported"}, 
                  AVIF: {supportsAvif ? "Supported" : "Not supported"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Grid */}
        <Card className={cn(effects.cardHoverable, animation.fadeIn)}>
          <CardHeader>
            <CardTitle>Responsive Grid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <MotionCard key={item} className="h-full" hover>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-md mb-2 flex items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground">{item}</span>
                    </div>
                    <h3 className="font-medium mb-1">Grid Item {item}</h3>
                    <p className="text-sm text-muted-foreground">
                      This is a responsive grid item that adapts to different screen sizes.
                    </p>
                  </CardContent>
                </MotionCard>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Animation Test */}
        <Card className={cn(effects.cardHoverable, animation.fadeIn)}>
          <CardHeader>
            <CardTitle>Animation Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className={cn(typography.body, "mb-4")}>
                The animations below will be {shouldReduceMotion ? "reduced" : "normal"} based on your preferences.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div 
                  className="p-4 bg-primary/10 rounded-lg border border-primary"
                  whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                >
                  <h3 className="font-medium mb-1">Hover Animation</h3>
                  <p className="text-sm text-muted-foreground">
                    Hover over this card to see an animation.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="p-4 bg-secondary/10 rounded-lg border border-secondary"
                  animate={shouldReduceMotion 
                    ? {} 
                    : { 
                        y: [0, -10, 0],
                        transition: { 
                          repeat: Infinity, 
                          duration: 2,
                          ease: "easeInOut" 
                        }
                      }
                  }
                >
                  <h3 className="font-medium mb-1">Continuous Animation</h3>
                  <p className="text-sm text-muted-foreground">
                    This card has a continuous animation.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="p-4 bg-accent/10 rounded-lg border border-accent"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: shouldReduceMotion ? 0 : 0.5,
                    ease: "easeOut"
                  }}
                >
                  <h3 className="font-medium mb-1">Entrance Animation</h3>
                  <p className="text-sm text-muted-foreground">
                    This card has an entrance animation.
                  </p>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Image Test */}
        <Card className={cn(effects.cardHoverable, animation.fadeIn)}>
          <CardHeader>
            <CardTitle>Responsive Image Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium mb-2">Standard Image</h3>
                <ResponsiveImage
                  src="/images/placeholder.svg"
                  alt="Placeholder Image"
                  width={600}
                  height={400}
                  rounded="md"
                />
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Responsive Image with Animation</h3>
                <ResponsiveImage
                  src="/images/placeholder.svg"
                  alt="Placeholder Image"
                  width={600}
                  height={400}
                  rounded="md"
                  withAnimation={!shouldReduceMotion}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
