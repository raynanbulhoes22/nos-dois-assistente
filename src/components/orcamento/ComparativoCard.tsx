import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparativoCardProps {
  title: string;
  valorProjetado: number;
  valorRealizado: number;
  isLoading?: boolean;
  formatValue?: (value: number) => string;
  showPercentage?: boolean;
  className?: string;
}

export const ComparativoCard = ({
  title,
  valorProjetado,
  valorRealizado,
  isLoading,
  formatValue = (value) => value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }),
  showPercentage = true,
  className
}: ComparativoCardProps) => {
  const percentualRealizacao = valorProjetado > 0 ? (valorRealizado / valorProjetado) * 100 : 0;
  
  const getPerformanceVariant = () => {
    if (percentualRealizacao >= 95) return "default";
    if (percentualRealizacao >= 80) return "secondary";
    return "destructive";
  };

  const getPerformanceIcon = () => {
    if (percentualRealizacao >= 100) return TrendingUp;
    if (percentualRealizacao >= 80) return Target;
    return TrendingDown;
  };

  const PerformanceIcon = getPerformanceIcon();

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-6 bg-muted rounded"></div>
          <div className="h-6 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Projetado</span>
            <span className="text-sm font-medium">
              {formatValue(valorProjetado)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Realizado</span>
            <span className="text-base font-semibold">
              {formatValue(valorRealizado)}
            </span>
          </div>
        </div>

        {showPercentage && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1">
              <PerformanceIcon className="h-3 w-3" />
              <span className="text-xs text-muted-foreground">Performance</span>
            </div>
            <Badge 
              variant={getPerformanceVariant()}
              className="text-xs"
            >
              {percentualRealizacao.toFixed(0)}%
            </Badge>
          </div>
        )}

        {/* Barra de progresso visual */}
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                percentualRealizacao >= 100 ? "bg-green-500" :
                percentualRealizacao >= 80 ? "bg-yellow-500" : 
                "bg-red-500"
              )}
              style={{ 
                width: `${Math.min(percentualRealizacao, 100)}%` 
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};