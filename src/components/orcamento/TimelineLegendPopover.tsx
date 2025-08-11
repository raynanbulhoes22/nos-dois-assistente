import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const legendItems = [
  {
    status: 'excelente',
    color: 'bg-success',
    label: 'Excelente',
    description: 'Situação financeira muito boa'
  },
  {
    status: 'positivo',
    color: 'bg-warning',
    label: 'Bom',
    description: 'Situação financeira positiva'
  },
  {
    status: 'quase_positivo',
    color: 'bg-primary',
    label: 'Quase Positivo',
    description: 'Próximo do equilíbrio (positivo)'
  },
  {
    status: 'critico',
    color: 'bg-critical',
    label: 'Crítico',
    description: 'Situação que requer atenção'
  },
  {
    status: 'quase_negativo',
    color: 'bg-critical/80',
    label: 'Quase Negativo',
    description: 'Próximo do equilíbrio (negativo)'
  },
  {
    status: 'deficit',
    color: 'bg-error',
    label: 'Déficit',
    description: 'Situação financeira negativa'
  },
  {
    status: 'sem-dados',
    color: 'bg-muted',
    label: 'Sem Dados',
    description: 'Informações não disponíveis'
  }
];

export const TimelineLegendPopover = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Status das Projeções Financeiras</h4>
          <div className="space-y-2">
            {legendItems.map((item) => (
              <div key={item.status} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-foreground">
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};