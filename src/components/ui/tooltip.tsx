"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          variant === 'default' && "bg-primary text-primary-foreground",
          variant === 'info' && "bg-blue-500 text-white",
          variant === 'success' && "bg-green-500 text-white",
          variant === 'warning' && "bg-yellow-500 text-white",
          variant === 'error' && "bg-red-500 text-white",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className={cn(
          "z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
          variant === 'default' && "bg-primary fill-primary",
          variant === 'info' && "bg-blue-500 fill-blue-500",
          variant === 'success' && "bg-green-500 fill-green-500",
          variant === 'warning' && "bg-yellow-500 fill-yellow-500",
          variant === 'error' && "bg-red-500 fill-red-500"
        )} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
