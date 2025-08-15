import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileSectionProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  onAdd?: () => void;
  addLabel?: string;
  children: ReactNode;
  className?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  iconVariant?: 'success' | 'error' | 'warning' | 'primary' | 'purple';
}

export const MobileSection = ({
  title,
  subtitle,
  icon: Icon,
  onAdd,
  addLabel = "Adicionar",
  children,
  className,
  isEmpty,
  emptyMessage,
  iconVariant = 'primary'
}: MobileSectionProps) => {
  const iconVariants = {
    success: "icon-success",
    error: "icon-error", 
    warning: "icon-warning",
    primary: "icon-primary",
    purple: "icon-purple"
  };

  return (
    <Card className={cn("border-0 sm:border shadow-none sm:shadow-md bg-transparent sm:bg-card", className)}>
      <CardHeader className="px-0 sm:px-6 pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center", iconVariants[iconVariant])}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg leading-tight truncate">{title}</CardTitle>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>
          {onAdd && (
            <Button 
              size="sm" 
              onClick={onAdd} 
              className="h-8 sm:h-9 px-2 sm:px-3 shadow-sm focus-ring shrink-0"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline text-xs">{addLabel}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-6 pb-4 sm:pb-6">
        {isEmpty ? (
          <div className="text-center py-6 sm:py-8 space-y-3">
            <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto flex items-center justify-center bg-muted/50", iconVariants[iconVariant])}>
              <Icon className="h-6 w-6 sm:h-8 sm:w-8 opacity-60" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">{emptyMessage}</p>
              {onAdd && (
                <Button 
                  onClick={onAdd} 
                  size="sm"
                  className="mt-3 h-9 px-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {addLabel}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};