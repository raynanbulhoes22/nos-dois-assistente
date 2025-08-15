import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileOptimizedLayoutProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
}

export const MobileOptimizedLayout = ({
  children,
  className,
  header,
  sidebar,
  footer
}: MobileOptimizedLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Mobile-first header */}
      {header && (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          {header}
        </div>
      )}

      <div className="flex w-full">
        {/* Desktop sidebar - hidden on mobile */}
        {sidebar && !isMobile && (
          <aside className="sticky top-0 h-screen bg-card border-r">
            {sidebar}
          </aside>
        )}

        {/* Main content area */}
        <main className={cn(
          "flex-1 overflow-x-hidden",
          isMobile ? "pb-20" : "pb-0" // Space for mobile nav
        )}>
          {children}
        </main>
      </div>

      {/* Mobile footer/navigation */}
      {footer && isMobile && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          {footer}
        </div>
      )}
    </div>
  );
};

// Mobile-optimized container
interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export const MobileContainer = ({ 
  children, 
  className, 
  padding = "md" 
}: MobileContainerProps) => {
  const isMobile = useIsMobile();

  const paddingClass = {
    none: "",
    sm: isMobile ? "p-2" : "p-4",
    md: isMobile ? "p-4" : "p-6",
    lg: isMobile ? "p-6" : "p-8"
  }[padding];

  return (
    <div className={cn(
      "mx-auto w-full",
      paddingClass,
      isMobile ? "max-w-none" : "max-w-7xl",
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-optimized grid
interface MobileGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: "sm" | "md" | "lg";
}

export const MobileGrid = ({ 
  children, 
  className, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "md"
}: MobileGridProps) => {
  const gapClass = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6"
  }[gap];

  const gridClass = cn(
    "grid",
    gapClass,
    `grid-cols-${cols.mobile}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    className
  );

  return <div className={gridClass}>{children}</div>;
};

// Mobile-optimized card
interface MobileCardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  interactive?: boolean;
}

export const MobileCard = ({ 
  children, 
  className, 
  padding = "md",
  interactive = false
}: MobileCardProps) => {
  const isMobile = useIsMobile();

  const paddingClass = {
    sm: isMobile ? "p-3" : "p-4",
    md: isMobile ? "p-4" : "p-6",
    lg: isMobile ? "p-6" : "p-8"
  }[padding];

  return (
    <div className={cn(
      "bg-card border rounded-lg shadow-sm",
      paddingClass,
      interactive && "transition-all duration-200 hover:shadow-md active:scale-[0.98]",
      isMobile && interactive && "touch-manipulation",
      className
    )}>
      {children}
    </div>
  );
};