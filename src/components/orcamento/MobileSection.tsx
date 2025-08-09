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
    <Card className={cn("section-card", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("icon-container", iconVariants[iconVariant])}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {onAdd && (
            <Button 
              size="sm" 
              onClick={onAdd} 
              className="shadow-md focus-ring"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{addLabel}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isEmpty ? (
          <div className="empty-state">
            <div className={cn("empty-state-icon bg-muted", iconVariants[iconVariant])}>
              <Icon className="h-8 w-8" />
            </div>
            <p className="text-muted-foreground">{emptyMessage}</p>
            {onAdd && (
              <Button onClick={onAdd} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                {addLabel}
              </Button>
            )}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};