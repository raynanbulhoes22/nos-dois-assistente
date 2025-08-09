import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthNavigationProps {
  currentMonth: number;
  currentYear: number;
  onNavigate: (direction: 'anterior' | 'proximo') => void;
  getMesNome: (mes: number) => string;
  statusMes?: 'excelente' | 'positivo' | 'critico' | 'deficit' | 'sem-dados';
}

export const MonthNavigation = ({
  currentMonth,
  currentYear,
  onNavigate,
  getMesNome,
  statusMes
}: MonthNavigationProps) => {
  const getStatusStyles = () => {
    switch (statusMes) {
      case 'excelente':
        return 'bg-success/10 text-success border-success/20 shadow-lg shadow-success/5';
      case 'positivo':
        return 'bg-warning/10 text-warning border-warning/20 shadow-lg shadow-warning/5';
      case 'critico':
        return 'bg-critical/10 text-critical border-critical/20 shadow-lg shadow-critical/5';
      case 'deficit':
        return 'bg-error/10 text-error border-error/20 shadow-lg shadow-error/5';
      case 'sem-dados':
        return 'bg-neutral/10 text-neutral border-neutral/20';
      default:
        return 'bg-background text-foreground border-border';
    }
  };

  return (
    <div className="navigation-month">
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => onNavigate('anterior')}
        className="h-8 w-8 p-0 hover:bg-muted focus-ring"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className={cn(
        "px-4 py-2 min-w-[160px] text-center rounded-lg border transition-colors duration-200",
        getStatusStyles()
      )}>
        <span className="font-semibold text-sm">
          {getMesNome(currentMonth)} {currentYear}
        </span>
      </div>
      
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => onNavigate('proximo')}
        className="h-8 w-8 p-0 hover:bg-muted focus-ring"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};