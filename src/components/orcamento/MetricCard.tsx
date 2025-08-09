import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: 'success' | 'error' | 'warning' | 'primary' | 'purple';
  className?: string;
  isLoading?: boolean;
  subtitle?: string;
}

export const MetricCard = ({
  title,
  value,
  icon: Icon,
  variant = 'primary',
  className,
  isLoading = false,
  subtitle
}: MetricCardProps) => {
  const variants = {
    success: {
      card: "metric-card-success",
      text: "text-success",
      icon: "icon-success"
    },
    error: {
      card: "metric-card-error",
      text: "text-error",
      icon: "icon-error"
    },
    warning: {
      card: "metric-card-warning",
      text: "text-warning",
      icon: "icon-warning"
    },
    primary: {
      card: "metric-card-primary",
      text: "text-primary",
      icon: "icon-primary"
    },
    purple: {
      card: "metric-card-purple",
      text: "text-purple-700 dark:text-purple-300",
      icon: "icon-purple"
    }
  };

  const currentVariant = variants[variant];

  return (
    <Card className={cn("metric-card", currentVariant.card, className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1 flex-1">
            <p className={cn("text-xs sm:text-sm font-medium", currentVariant.text)}>
              {title}
            </p>
            {isLoading ? (
              <div className="h-6 sm:h-8 bg-muted animate-pulse rounded" />
            ) : (
              <p className={cn("text-lg sm:text-2xl font-bold", currentVariant.text)}>
                {value}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn("icon-container", currentVariant.icon)}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};