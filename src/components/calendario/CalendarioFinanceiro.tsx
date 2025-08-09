import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";

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

    return (
      <div
        className={cn(
          "w-full h-full min-h-[80px] p-2 rounded-md transition-all duration-200 relative",
          heatCls,
          isCurrentDay ? "ring-2 ring-primary/50" : undefined,
          hasEvents ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:ring-2 hover:ring-primary/30" : "cursor-default"
        )}
      >
        {/* Número do dia */}
        <div
          className={cn(
            "text-center mb-2 font-medium text-sm",
            isCurrentDay ? "text-primary font-bold" : "text-foreground"
          )}
        >
          {format(data, "d")}
        </div>

        {/* Informações dos eventos */}
        {hasEvents && (
          <div className="space-y-1">
            <div
              className={cn(
                "text-[10px] text-center font-semibold px-1 py-0.5 rounded",
                (eventosDia!.saldo || 0) >= 0 ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
              )}
            >
              {eventosDia!.eventos.length} {eventosDia!.eventos.length === 1 ? "evento" : "eventos"}
            </div>
            
            <div
              className={cn(
                "text-[10px] text-center font-bold",
                (eventosDia!.saldo || 0) >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {eventosDia!.saldo > 0 ? "+" : ""}
              {(eventosDia!.saldo || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>

            {/* Indicador visual que é clicável */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-primary/5 rounded-md">
              <div className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                Ver detalhes
              </div>
            </div>
          </div>
        )}
      </div>
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
          className="w-full pointer-events-auto"
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
            cell: "relative w-full h-24 text-center text-sm focus-within:relative focus-within:z-20 border border-border/50",
            day: "h-full w-full p-0 font-normal relative flex flex-col",
            day_today: "bg-primary/5",
            day_selected: "bg-primary/10",
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