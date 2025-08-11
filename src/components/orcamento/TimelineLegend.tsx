import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const legendItems = [
  {
    status: 'excelente',
    color: 'bg-success border-success',
    label: 'Excelente',
    description: 'Situação financeira muito boa'
  },
  {
    status: 'positivo',
    color: 'bg-warning border-warning',
    label: 'Bom',
    description: 'Situação financeira positiva'
  },
  {
    status: 'quase_positivo',
    color: 'bg-primary border-primary',
    label: 'Quase Positivo',
    description: 'Próximo do equilíbrio (positivo)'
  },
  {
    status: 'critico',
    color: 'bg-critical border-critical',
    label: 'Crítico',
    description: 'Situação que requer atenção'
  },
  {
    status: 'quase_negativo',
    color: 'bg-critical/80 border-critical',
    label: 'Quase Negativo',
    description: 'Próximo do equilíbrio (negativo)'
  },
  {
    status: 'deficit',
    color: 'bg-error border-error',
    label: 'Déficit',
    description: 'Situação financeira negativa'
  },
  {
    status: 'sem-dados',
    color: 'bg-background border-border',
    label: 'Sem Dados',
    description: 'Informações não disponíveis'
  }
];

interface TimelineLegendProps {
  compact?: boolean;
  collapsible?: boolean;
}

export const TimelineLegend = ({ compact = false, collapsible = false }: TimelineLegendProps) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  if (collapsible && !isExpanded) {
    return (
      <div className="flex justify-center mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="h-3 w-3 mr-1" />
          Ver legenda
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {collapsible && (
        <div className="flex justify-center mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronUp className="h-3 w-3 mr-1" />
            Ocultar legenda
          </Button>
        </div>
      )}
      
      <div className={cn(
        "bg-muted/30 rounded-lg p-3 border border-border/50",
        compact ? "p-2" : "p-3"
      )}>
        <div className={cn(
          "grid gap-2",
          compact ? "grid-cols-2 sm:grid-cols-4 gap-1.5" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        )}>
          {legendItems.map((item) => (
            <div 
              key={item.status}
              className={cn(
                "flex items-center gap-2",
                compact ? "text-xs" : "text-sm"
              )}
            >
              <div className={cn(
                "w-3 h-3 rounded-full border-2 flex-shrink-0",
                item.color
              )} />
              <div className="min-w-0 flex-1">
                <div className={cn(
                  "font-medium text-foreground truncate",
                  compact ? "text-xs" : "text-sm"
                )}>
                  {item.label}
                </div>
                {!compact && (
                  <div className="text-xs text-muted-foreground leading-tight">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {compact && (
          <div className="text-xs text-muted-foreground text-center mt-2 leading-tight">
            Status das projeções financeiras mensais
          </div>
        )}
      </div>
    </div>
  );
};