import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniTimeline } from "@/components/orcamento/MiniTimeline";
import { TimelineLegendPopover } from "@/components/orcamento/TimelineLegendPopover";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { ptBR } from "date-fns/locale";
interface MonthNavigationProps {
  currentMonth: number;
  currentYear: number;
  onNavigate: (direction: 'anterior' | 'proximo') => void;
  getMesNome: (mes: number) => string;
  statusMes?: 'excelente' | 'positivo' | 'critico' | 'deficit' | 'sem-dados';
  timeline?: {
    mes: number;
    ano: number;
    status: string;
    saldoProjetado: number;
    receitas: number;
  }[];
  onMonthSelect?: (mes: number, ano: number) => void;
}
export const MonthNavigation = ({
  currentMonth,
  currentYear,
  onNavigate,
  getMesNome,
  statusMes,
  timeline,
  onMonthSelect
}: MonthNavigationProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleMonthSelect = (date: Date | undefined) => {
    if (date && onMonthSelect) {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      onMonthSelect(month, year);
      setIsCalendarOpen(false);
    }
  };
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
  return <div className="navigation-month space-y-3 mx-0 px-2 sm:px-4 md:px-8 lg:px-[162px]">
      <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 overflow-x-auto">
        <Button size="sm" variant="ghost" onClick={() => onNavigate('anterior')} className="h-8 w-8 p-0 hover:bg-muted focus-ring flex-shrink-0" aria-label="Mês anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Timeline esquerda: meses passados */}
        {timeline && timeline.length > 0 ? <div className="hidden sm:block flex-shrink-0">
            <MiniTimeline previsoes={timeline.filter(t => t.ano < currentYear || t.ano === currentYear && t.mes < currentMonth).sort((a, b) => a.ano - b.ano || a.mes - b.mes)} currentMonth={currentMonth} currentYear={currentYear} onMonthSelect={onMonthSelect || (() => {})} getMesNome={getMesNome} />
          </div> : null}

        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
             <Button
               variant="outline"
               className={cn(
                 "px-3 sm:px-4 py-2 min-w-[120px] sm:min-w-[140px] md:min-w-[160px] text-center rounded-lg border transition-colors duration-200 hover:bg-muted/50 active:scale-95 flex-shrink-0",
                 getStatusStyles()
               )}
             >
               <span className="font-semibold text-xs sm:text-sm mr-1 sm:mr-2">
                 {getMesNome(currentMonth)} {currentYear}
               </span>
               <CalendarIcon className="h-3 w-3 opacity-70 flex-shrink-0" />
             </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0" 
            align="center"
            side="bottom"
            sideOffset={4}
          >
            <Calendar
              mode="single"
              selected={new Date(currentYear, currentMonth - 1)}
              onSelect={handleMonthSelect}
              locale={ptBR}
              className="pointer-events-auto"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-input hover:bg-accent hover:text-accent-foreground rounded-md"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative hover:bg-accent hover:text-accent-foreground focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Timeline direita: meses futuros */}
        {timeline && timeline.length > 0 ? <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <MiniTimeline previsoes={timeline.filter(t => t.ano > currentYear || t.ano === currentYear && t.mes > currentMonth).sort((a, b) => a.ano - b.ano || a.mes - b.mes)} currentMonth={currentMonth} currentYear={currentYear} onMonthSelect={onMonthSelect || (() => {})} getMesNome={getMesNome} />
            <TimelineLegendPopover />
          </div> : null}

        <Button size="sm" variant="ghost" onClick={() => onNavigate('proximo')} className="h-8 w-8 p-0 hover:bg-muted focus-ring flex-shrink-0" aria-label="Próximo mês">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

    </div>;
};