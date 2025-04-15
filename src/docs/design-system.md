# RideWeather Design System Documentation

This document provides an overview of the design system used in the RideWeather application. The design system is built on top of Tailwind CSS and provides a consistent set of utilities, components, and patterns for building the application.

## Table of Contents

1. [Introduction](#introduction)
2. [Typography](#typography)
3. [Colors](#colors)
4. [Layout](#layout)
5. [Effects](#effects)
6. [Animations](#animations)
7. [Components](#components)
8. [Usage Guidelines](#usage-guidelines)

## Introduction

The RideWeather design system is a collection of reusable components, utilities, and patterns that provide a consistent look and feel across the application. It is built on top of Tailwind CSS and uses the `class-variance-authority` (cva) pattern for creating component variants.

The design system is implemented in the `src/styles/tailwind-utils.ts` file, which provides a set of utility functions for applying consistent styling to components.

## Typography

The typography system provides a consistent set of text styles for headings, body text, and other typographic elements.

### Heading Styles

- `typography.h1`: Large heading (2.5rem/40px)
- `typography.h2`: Medium heading (2rem/32px)
- `typography.h3`: Small heading (1.5rem/24px)
- `typography.h4`: Extra small heading (1.25rem/20px)
- `typography.h5`: Tiny heading (1.125rem/18px)
- `typography.h6`: Micro heading (1rem/16px)

### Body Text Styles

- `typography.body`: Regular body text
- `typography.bodySm`: Small body text
- `typography.bodyLg`: Large body text
- `typography.lead`: Lead paragraph text

### Special Text Styles

- `typography.muted`: Muted text (lower contrast)
- `typography.link`: Link text with hover effects
- `typography.strong`: Bold/emphasized text
- `typography.code`: Monospace code text
- `typography.center`: Centered text

### Example Usage

```tsx
<h1 className={typography.h1}>Main Heading</h1>
<p className={typography.body}>Regular paragraph text</p>
<p className={cn(typography.bodySm, typography.muted)}>Small muted text</p>
```

## Colors

The color system provides a consistent set of colors for the application. It uses Tailwind CSS's color palette with semantic color variables for different states.

### Semantic Colors

- `primary`: Main brand color
- `secondary`: Secondary brand color
- `accent`: Accent color for highlights
- `background`: Background color
- `foreground`: Text color
- `muted`: Muted background color
- `muted-foreground`: Muted text color
- `border`: Border color
- `input`: Input field color
- `ring`: Focus ring color

### State Colors

- `success`: Success state color (green)
- `warning`: Warning state color (yellow/orange)
- `error`: Error state color (red)
- `info`: Information state color (blue)

### Example Usage

```tsx
<div className="bg-background text-foreground">
  <span className="text-primary">Primary text</span>
  <span className="text-muted-foreground">Muted text</span>
  <div className="bg-success/10 text-success">Success message</div>
</div>
```

## Layout

The layout system provides a consistent set of layout utilities for building responsive layouts.

### Container and Spacing

- `layout.container`: Standard container with responsive padding
- `layout.section`: Section container with vertical spacing
- `layout.card`: Card container with padding and rounded corners

### Flex Layouts

- `layout.flexRow`: Row flex container
- `layout.flexCol`: Column flex container
- `layout.flexCenter`: Centered flex container (both horizontal and vertical)
- `layout.flexBetween`: Flex container with space-between
- `layout.flexStart`: Flex container with items aligned to start
- `layout.flexEnd`: Flex container with items aligned to end

### Grid Layouts

- `layout.grid`: Basic grid layout
- `layout.gridSm`: Small grid (2 columns on mobile, more on larger screens)
- `layout.gridMd`: Medium grid (1 column on mobile, 2 on tablet, 3 on desktop)
- `layout.gridLg`: Large grid (1 column on mobile, 2 on tablet, 4 on desktop)

### Example Usage

```tsx
<div className={layout.container}>
  <div className={layout.section}>
    <div className={layout.flexBetween}>
      <div>Left content</div>
      <div>Right content</div>
    </div>
    <div className={layout.gridMd}>
      <div>Grid item 1</div>
      <div>Grid item 2</div>
      <div>Grid item 3</div>
    </div>
  </div>
</div>
```

## Effects

The effects system provides a consistent set of visual effects for components.

### Borders and Shadows

- `effects.border`: Standard border
- `effects.borderTop`: Top border
- `effects.borderBottom`: Bottom border
- `effects.rounded`: Rounded corners
- `effects.shadow`: Standard shadow
- `effects.shadowLg`: Large shadow

### Interactive Effects

- `effects.buttonHover`: Hover effect for buttons
- `effects.cardHoverable`: Hover effect for cards
- `effects.cardInner`: Inner card styling

### Example Usage

```tsx
<div className={cn(effects.rounded, effects.shadow, "p-4")}>
  <button className={effects.buttonHover}>Hover me</button>
  <div className={effects.cardInner}>Inner card content</div>
</div>
```

## Animations

The animation system provides a consistent set of animations for components.

### Fade Animations

- `animation.fadeIn`: Fade in animation
- `animation.fadeInSlideUp`: Fade in and slide up animation
- `animation.fadeInSlideDown`: Fade in and slide down animation

### Interactive Animations

- `animation.hoverLift`: Lift on hover animation
- `animation.hoverLiftSm`: Small lift on hover animation
- `animation.buttonPress`: Button press animation
- `animation.linkHover`: Link hover animation

### Example Usage

```tsx
<div className={animation.fadeIn}>
  <button className={animation.buttonPress}>Click me</button>
  <a className={animation.linkHover}>Hover me</a>
</div>
```

## Components

The design system includes a set of reusable components built on top of the utility functions.

### Basic Components

- `Button`: Interactive button component with variants
- `Card`: Card container component
- `Badge`: Badge component for labels and tags
- `Alert`: Alert component for notifications

### Form Components

- `Input`: Text input component
- `Textarea`: Multi-line text input component
- `Checkbox`: Checkbox input component
- `RadioGroup`: Radio button group component
- `Select`: Dropdown select component

### Layout Components

- `Header`: Page header component
- `Footer`: Page footer component
- `PageWrapper`: Page wrapper component
- `MobileNav`: Mobile navigation component

### Example Usage

```tsx
<Card className={effects.cardHoverable}>
  <CardHeader>
    <CardTitle className={typography.h4}>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className={typography.body}>Card content</p>
  </CardContent>
  <CardFooter>
    <Button className={effects.buttonHover}>Click me</Button>
  </CardFooter>
</Card>
```

## Usage Guidelines

### Best Practices

1. **Use the utility functions**: Always use the utility functions from `tailwind-utils.ts` instead of writing raw Tailwind classes when possible.

2. **Combine utilities with `cn`**: Use the `cn` function to combine utility classes with additional Tailwind classes.

3. **Be consistent**: Use the same patterns and utilities across the application for a consistent look and feel.

4. **Responsive design**: Use the responsive utilities to create layouts that work well on all screen sizes.

5. **Accessibility**: Ensure that all components are accessible by using proper ARIA attributes and keyboard navigation.

### Example Component

Here's an example of a component that uses the design system:

```tsx
import { cn } from '@/lib/utils';
import { typography, animation, effects, layout } from '@/styles/tailwind-utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export function FeatureCard({ title, description, icon, className }: FeatureCardProps) {
  return (
    <div 
      className={cn(
        effects.cardHoverable, 
        animation.fadeIn, 
        "p-6", 
        className
      )}
    >
      <div className={cn(layout.flexRow, "gap-4")}>
        <div className={cn(layout.flexCenter, "w-10 h-10 rounded-full bg-primary/10")}>
          {icon}
        </div>
        <div>
          <h3 className={typography.h5}>{title}</h3>
          <p className={cn(typography.bodySm, typography.muted, "mt-1")}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
```

This component uses the design system utilities to create a consistent look and feel that matches the rest of the application.
