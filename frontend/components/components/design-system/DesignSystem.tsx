'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@frontend/components/ui/card';
import { Button } from '@frontend/components/ui/button';
import { Input } from '@frontend/components/ui/input';
import { Skeleton } from '@frontend/components/ui/skeleton';
import { typography, layout, animation, effects, status, loading } from '@shared/styles/tailwind-utils';
import { cn } from '@shared/lib/utils';

/**
 * A component that showcases the design system
 */
export function DesignSystem() {
  return (
    <div className="container mx-auto py-12 space-y-12">
      <section className="space-y-4">
        <h1 className={typography.h1}>Design System</h1>
        <p className={typography.body}>
          This page showcases the design system for the application, including colors, typography,
          components, and more.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className={typography.h2}>Colors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ColorCard name="Primary" color="bg-primary" textColor="text-primary-foreground" />
          <ColorCard name="Primary Light" color="bg-primary-light" textColor="text-primary-foreground" />
          <ColorCard name="Primary Dark" color="bg-primary-dark" textColor="text-primary-foreground" />
          <ColorCard name="Secondary" color="bg-secondary" textColor="text-secondary-foreground" />
          <ColorCard name="Secondary Light" color="bg-secondary-light" textColor="text-secondary-foreground" />
          <ColorCard name="Secondary Dark" color="bg-secondary-dark" textColor="text-secondary-foreground" />
          <ColorCard name="Accent" color="bg-accent" textColor="text-accent-foreground" />
          <ColorCard name="Accent Light" color="bg-accent-light" textColor="text-accent-foreground" />
          <ColorCard name="Accent Dark" color="bg-accent-dark" textColor="text-accent-foreground" />
          <ColorCard name="Destructive" color="bg-destructive" textColor="text-destructive-foreground" />
          <ColorCard name="Success" color="bg-success" textColor="text-success-foreground" />
          <ColorCard name="Warning" color="bg-warning" textColor="text-warning-foreground" />
          <ColorCard name="Info" color="bg-info" textColor="text-info-foreground" />
          <ColorCard name="Muted" color="bg-muted" textColor="text-muted-foreground" />
          <ColorCard name="Background" color="bg-background" textColor="text-foreground" />
          <ColorCard name="Card" color="bg-card" textColor="text-card-foreground" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className={typography.h2}>Typography</h2>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <h1 className={typography.h1}>Heading 1</h1>
              <p className="text-sm text-muted-foreground">typography.h1</p>
            </div>
            <div className="space-y-2">
              <h2 className={typography.h2}>Heading 2</h2>
              <p className="text-sm text-muted-foreground">typography.h2</p>
            </div>
            <div className="space-y-2">
              <h3 className={typography.h3}>Heading 3</h3>
              <p className="text-sm text-muted-foreground">typography.h3</p>
            </div>
            <div className="space-y-2">
              <h4 className={typography.h4}>Heading 4</h4>
              <p className="text-sm text-muted-foreground">typography.h4</p>
            </div>
            <div className="space-y-2">
              <h5 className={typography.h5}>Heading 5</h5>
              <p className="text-sm text-muted-foreground">typography.h5</p>
            </div>
            <div className="space-y-2">
              <h6 className={typography.h6}>Heading 6</h6>
              <p className="text-sm text-muted-foreground">typography.h6</p>
            </div>
            <div className="space-y-2">
              <p className={typography.body}>Body text</p>
              <p className="text-sm text-muted-foreground">typography.body</p>
            </div>
            <div className="space-y-2">
              <p className={typography.bodyLg}>Large body text</p>
              <p className="text-sm text-muted-foreground">typography.bodyLg</p>
            </div>
            <div className="space-y-2">
              <p className={typography.bodySm}>Small body text</p>
              <p className="text-sm text-muted-foreground">typography.bodySm</p>
            </div>
            <div className="space-y-2">
              <p className={typography.muted}>Muted text</p>
              <p className="text-sm text-muted-foreground">typography.muted</p>
            </div>
            <div className="space-y-2">
              <p className={typography.link}>Link text</p>
              <p className="text-sm text-muted-foreground">typography.link</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className={typography.h2}>Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className={typography.h3}>Buttons</h3>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button isLoading>Loading</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className={typography.h3}>Inputs</h3>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <Input placeholder="Default input" />
                <Input placeholder="Disabled input" disabled />
                <Input placeholder="With left icon" leftIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                } />
                <Input placeholder="With right icon" rightIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                } />
                <Input placeholder="Invalid input" isInvalid errorMessage="This field is required" />
                <Input placeholder="Valid input" isValid />
                <Input type="password" placeholder="Password input" showPasswordToggle />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className={typography.h3}>Cards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>This is a default card component</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card content goes here</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md hover:translate-y-[-2px] transition-all duration-200">
                <CardHeader>
                  <CardTitle>Hoverable Card</CardTitle>
                  <CardDescription>This card has hover effects</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Card content goes here</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className={typography.h3}>Loading States</h3>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <h4 className={typography.h4}>Skeletons</h4>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={typography.h4}>Spinners</h4>
                  <div className="flex gap-4">
                    <div className={loading.spinnerSm}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </div>
                    <div className={loading.spinnerMd}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </div>
                    <div className={loading.spinnerLg}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={typography.h4}>Progress</h4>
                  <div className={loading.progress}>
                    <div className={loading.progressBar} style={{ width: '60%' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={typography.h4}>Indeterminate Progress</h4>
                  <div className={loading.progressIndeterminate}>
                    <div className={loading.progressIndeterminateBar} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className={typography.h2}>Status Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className={typography.h3}>Status Badges</h3>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-wrap gap-2">
                  <span className={status.badgeSuccess}>Success</span>
                  <span className={status.badgeError}>Error</span>
                  <span className={status.badgeWarning}>Warning</span>
                  <span className={status.badgeInfo}>Info</span>
                  <span className={status.badgeNeutral}>Neutral</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={status.badgeSuccessSolid}>Success</span>
                  <span className={status.badgeErrorSolid}>Error</span>
                  <span className={status.badgeWarningSolid}>Warning</span>
                  <span className={status.badgeInfoSolid}>Info</span>
                  <span className={status.badgeNeutralSolid}>Neutral</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={status.badgeSuccessOutline}>Success</span>
                  <span className={status.badgeErrorOutline}>Error</span>
                  <span className={status.badgeWarningOutline}>Warning</span>
                  <span className={status.badgeInfoOutline}>Info</span>
                  <span className={status.badgeNeutralOutline}>Neutral</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className={typography.h3}>Status Alerts</h3>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className={status.alertSuccess}>
                  <div className="font-medium">Success</div>
                  <div>Operation completed successfully.</div>
                </div>
                <div className={status.alertError}>
                  <div className="font-medium">Error</div>
                  <div>There was an error processing your request.</div>
                </div>
                <div className={status.alertWarning}>
                  <div className="font-medium">Warning</div>
                  <div>Please review the information before proceeding.</div>
                </div>
                <div className={status.alertInfo}>
                  <div className="font-medium">Info</div>
                  <div>Here's some information you might find useful.</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className={typography.h2}>Animations & Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className={typography.h3}>Animations</h3>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <h4 className={typography.h4}>Fade In</h4>
                  <div className={animation.fadeIn}>
                    <div className="p-4 bg-muted rounded-md">Fade In</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={typography.h4}>Slide In From Bottom</h4>
                  <div className={animation.slideInFromBottom}>
                    <div className="p-4 bg-muted rounded-md">Slide In From Bottom</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={typography.h4}>Hover Scale</h4>
                  <div className={animation.hoverScale}>
                    <div className="p-4 bg-muted rounded-md">Hover Scale (Hover me)</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={typography.h4}>Hover Lift</h4>
                  <div className={animation.hoverLift}>
                    <div className="p-4 bg-muted rounded-md">Hover Lift (Hover me)</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={typography.h4}>Button Press</h4>
                  <div className={animation.buttonPress}>
                    <div className="p-4 bg-muted rounded-md">Button Press (Click me)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className={typography.h3}>Effects</h3>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <h4 className={typography.h4}>Glassmorphism</h4>
                  <div className="relative h-32 bg-gradient-to-r from-primary to-accent rounded-md overflow-hidden">
                    <div className={cn(effects.glassmorphism, "absolute inset-4 rounded-md flex items-center justify-center")}>
                      <p className="font-medium">Glassmorphism Effect</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={typography.h4}>Shadows</h4>
                  <div className="flex flex-wrap gap-4">
                    <div className={cn(effects.shadow, "p-4 bg-card rounded-md")}>Shadow</div>
                    <div className={cn(effects.shadowMd, "p-4 bg-card rounded-md")}>Shadow MD</div>
                    <div className={cn(effects.shadowLg, "p-4 bg-card rounded-md")}>Shadow LG</div>
                    <div className={cn(effects.shadowXl, "p-4 bg-card rounded-md")}>Shadow XL</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={typography.h4}>Borders</h4>
                  <div className="flex flex-wrap gap-4">
                    <div className={cn(effects.border, "p-4 bg-card rounded-md")}>Border</div>
                    <div className={cn(effects.borderDashed, "p-4 bg-card rounded-md")}>Dashed</div>
                    <div className={cn(effects.borderPrimary, "p-4 bg-card rounded-md")}>Primary</div>
                    <div className={cn(effects.borderAccent, "p-4 bg-card rounded-md")}>Accent</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className={typography.h4}>Special Effects</h4>
                  <div className="flex flex-wrap gap-4">
                    <div className={cn(effects.elevate, "p-4 bg-card rounded-md")}>Elevate</div>
                    <div className={cn(effects.depressed, "p-4 rounded-md")}>Depressed</div>
                    <div className={cn(effects.outlined, "p-4 bg-card rounded-md")}>Outlined</div>
                    <div className={cn(effects.outlinedPrimary, "p-4 bg-card rounded-md")}>Primary Outlined</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * A card that displays a color
 */
function ColorCard({ name, color, textColor }: { name: string; color: string; textColor: string }) {
  return (
    <div className="space-y-2">
      <div className={cn(color, textColor, "h-20 rounded-md flex items-center justify-center")}>
        <span className="font-medium">{name}</span>
      </div>
      <p className="text-sm text-muted-foreground text-center">{color}</p>
    </div>
  );
}
