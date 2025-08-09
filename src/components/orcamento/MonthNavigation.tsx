import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthNavigationProps {
  currentMonth: number;
  currentYear: number;
  onNavigate: (direction: 'anterior' | 'proximo') => void;
  getMesNome: (mes: number) => string;
}

export const MonthNavigation = ({
  currentMonth,
  currentYear,
  onNavigate,
  getMesNome
}: MonthNavigationProps) => {
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
      
      <div className="px-3 py-1 min-w-[140px] text-center">
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