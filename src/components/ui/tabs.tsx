import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center text-muted-foreground transition-smooth",
        // Mobile: Ultra minimal segmented control
        isMobile 
          ? "h-9 rounded-xl bg-muted/20 p-1 border border-border/20 w-full max-w-sm mx-auto" 
          // Desktop: Enhanced but cleaner design
          : "h-12 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm p-1.5 shadow-lg border border-border/50",
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile()
  
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        // Mobile: iOS segmented control style - ultra minimal
        isMobile 
          ? "flex-1 rounded-lg px-2 py-1.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm" 
          // Desktop: Enhanced design with effects
          : "rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-background/60 hover:text-foreground/80 hover:shadow-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:scale-105",
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
