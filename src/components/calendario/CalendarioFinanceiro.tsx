import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { DayEvents } from "./DayEvents";
import { useEventosCalendario } from "@/hooks/useEventosCalendario";
import { format, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { DayDetailsModal } from "./DayDetailsModal";
import { CalendarioFilters } from "./CalendarioFilters";
import { EventosDia } from "./tipos";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CalendarioFinanceiroProps {
  mesAtual: number;
  anoAtual: number;
}

export const CalendarioFinanceiro = ({ mesAtual, anoAtual }: CalendarioFinanceiroProps) => {
  const { eventosPorDia, filtros, setFiltros, isLoading } = useEventosCalendario(mesAtual, anoAtual);
  const [selectedDay, setSelectedDay] = useState<EventosDia | null>(null);

  const handleDayClick = (data: Date) => {
    const eventosDia = eventosPorDia.find(dia => isSameDay(dia.data, data));
    if (eventosDia && eventosDia.eventos.length > 0) {
      setSelectedDay(eventosDia);
    }
  };

  const getDayContent = (data: Date) => {
    const eventosDia = eventosPorDia.find(dia => isSameDay(dia.data, data));
    const hasEvents = !!(eventosDia && eventosDia.eventos.length > 0);
    const isCurrentDay = isToday(data);

    const saldo = eventosDia?.saldo ?? 0;
    const abs = Math.abs(saldo);
    let heatCls = "";
    if (hasEvents) {
      if (saldo > 0) {
        heatCls = abs > 2000 ? "bg-success/30" : abs > 800 ? "bg-success/20" : "bg-success/10";
      } else if (saldo < 0) {
        heatCls = abs > 2000 ? "bg-destructive/30" : abs > 800 ? "bg-destructive/20" : "bg-destructive/10";
      }
    }

    const inner = (
      <div
        className={cn(
          "w-full h-full min-h-[80px] p-1 rounded-md transition-colors",
          heatCls,
          isCurrentDay ? "ring-1 ring-primary/40" : undefined
        )}
      >
        <div
          className={cn(
            "text-center mb-1 font-medium",
            isCurrentDay ? "text-primary font-bold" : "text-foreground"
          )}
        >
          {format(data, "d")}
        </div>

        {hasEvents && (
          <DayEvents
            eventos={eventosDia!.eventos}
            isToday={isCurrentDay}
            className="max-h-16 overflow-hidden"
          />
        )}

        {hasEvents && eventosDia!.saldo !== 0 && (
          <div
            className={cn(
              "text-xs mt-1 text-center font-semibold",
              eventosDia!.saldo > 0 ? "text-success" : "text-destructive"
            )}
          >
            {eventosDia!.saldo > 0 ? "+" : ""}
            {eventosDia!.saldo.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </div>
        )}
      </div>
    );

    if (!hasEvents) return inner;

    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>{inner}</TooltipTrigger>
          <TooltipContent side="top" align="center" className="space-y-1">
            <div className="text-xs font-medium">
              {format(data, "PPP", { locale: ptBR })}
            </div>
            <div className="flex justify-between gap-4 text-xs">
              <span>Entradas</span>
              <span className="text-success font-semibold">
                {(eventosDia!.totalEntradas || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            <div className="flex justify-between gap-4 text-xs">
              <span>Saídas</span>
              <span className="text-destructive font-semibold">
                {(eventosDia!.totalSaidas || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            <div className="flex justify-between gap-4 text-xs">
              <span>Saldo</span>
              <span className={cn("font-semibold", (eventosDia!.saldo || 0) >= 0 ? "text-success" : "text-destructive")}>
                {(eventosDia!.saldo || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CalendarioFilters filtros={filtros} onChange={setFiltros} />
      
      <Card className="overflow-hidden">
        <Calendar
          mode="single"
          locale={ptBR}
          month={new Date(anoAtual, mesAtual - 1)}
          onDayClick={handleDayClick}
          className="w-full"
          classNames={{
            months: "flex w-full",
            month: "space-y-4 w-full",
            caption: "flex justify-center pt-2 pb-4 relative items-center",
            caption_label: "text-lg font-semibold",
            nav: "space-x-1 flex items-center",
            nav_button: "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-muted rounded-md",
            nav_button_previous: "absolute left-4",
            nav_button_next: "absolute right-4",
            table: "w-full border-collapse space-y-1",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground rounded-md w-full font-semibold text-sm py-2",
            row: "flex w-full",
            cell: "relative w-full h-24 text-center text-sm focus-within:relative focus-within:z-20 border border-border/50 hover:bg-muted/50 transition-colors",
            day: "h-full w-full p-0 font-normal relative flex flex-col cursor-pointer",
            day_today: "bg-primary/10 border-primary/50",
            day_selected: "bg-primary text-primary-foreground",
            day_outside: "text-muted-foreground opacity-30",
            day_disabled: "text-muted-foreground opacity-20",
          }}
          components={{
            DayContent: ({ date }) => getDayContent(date),
          }}
          showOutsideDays={false}
        />
      </Card>

      {selectedDay && (
        <DayDetailsModal
          eventosDia={selectedDay}
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
};