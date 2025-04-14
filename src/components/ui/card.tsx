import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Whether the card is interactive */
    interactive?: boolean;
    /** Whether the card is hoverable */
    hoverable?: boolean;
    /** Whether the card has a border */
    bordered?: boolean;
    /** Whether the card has a shadow */
    shadowed?: boolean;
    /** Whether the card is compact */
    compact?: boolean;
  }
>(({
  className,
  interactive = false,
  hoverable = true,
  bordered = true,
  shadowed = true,
  compact = false,
  ...props
}, ref) => (
  <div
    ref={ref}
    data-slot="card"
    className={cn(
      "rounded-lg bg-card text-card-foreground transition-all duration-200",
      bordered && "border",
      shadowed && "shadow-sm",
      hoverable && "hover:shadow-md hover:translate-y-[-2px]",
      interactive && "cursor-pointer",
      compact && "p-3",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Whether the card is compact */
    compact?: boolean;
  }
>(({ className, compact = false, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn(
      "flex flex-col space-y-1.5 rounded-t-lg",
      compact ? "p-3" : "p-6",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" }
>(({ className, as: Comp = "h3", ...props }, ref) => (
  <Comp
    ref={ref}
    data-slot="card-title"
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="card-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Whether the card is compact */
    compact?: boolean;
  }
>(({ className, compact = false, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn(
      "rounded-b-lg",
      compact ? "p-3 pt-0" : "p-6 pt-0",
      className
    )}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Whether the card is compact */
    compact?: boolean;
  }
>(({ className, compact = false, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn(
      "flex items-center rounded-b-lg",
      compact ? "p-3 pt-0" : "p-6 pt-0",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
