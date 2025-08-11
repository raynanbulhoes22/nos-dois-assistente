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
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarioFinanceiroProps {
  mesAtual: number;
  anoAtual: number;
}

export const CalendarioFinanceiro = ({ mesAtual, anoAtual }: CalendarioFinanceiroProps) => {
  const { eventosPorDia, filtros, setFiltros, isLoading } = useEventosCalendario(mesAtual, anoAtual);
  const [selectedDay, setSelectedDay] = useState<EventosDia | null>(null);
  const isMobile = useIsMobile();

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
          "w-full h-full p-0.5 sm:p-2 rounded-md transition-all duration-200 relative",
          heatCls,
          hasEvents && (isMobile ? "cursor-pointer active:opacity-80" : "cursor-pointer hover:scale-105 hover:shadow-lg hover:z-10 active:scale-95")
        )}
        onClick={hasEvents ? () => handleDayClick(data) : undefined}
      >
        <div className="flex flex-col h-full">
          {isCurrentDay && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary" aria-label="Hoje" />
          )}
          <div className="text-xs sm:text-sm font-medium mb-1">{format(data, "d")}</div>
          
          {hasEvents && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {isMobile ? (
                <>
                  <div className="flex items-center gap-1 mb-1">
                    {eventosDia?.eventos.slice(0, 3).map((evento, index) => (
                      <span
                        key={index}
                        className={cn(
                          "block rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2",
                          evento.isEntrada ? "bg-success" : "bg-destructive"
                        )}
                      />
                    ))}
                    {(eventosDia?.eventos.length ?? 0) > 3 && (
                      <span className="text-[10px] text-muted-foreground font-medium">
                        +{(eventosDia?.eventos.length ?? 0) - 3}
                      </span>
                    )}
                  </div>
                  {saldo !== 0 && (
                    <div
                      className={cn(
                        "text-[10px] font-semibold",
                        saldo > 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {`${saldo > 0 ? "+" : ""}${Math.abs(saldo) > 1000 ? `${(saldo / 1000).toFixed(1)}k` : saldo.toFixed(0)}`}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex-1 space-y-1">
                    {eventosDia?.eventos.slice(0, 1).map((evento, index) => {
                      const pill = (
                        <div
                          className={cn(
                            "text-[11px] p-0.5 sm:p-1 rounded truncate",
                            evento.isEntrada ? "bg-success/20 text-success-foreground" : "bg-destructive/20 text-destructive-foreground"
                          )}
                        >
                          <span className="hidden sm:inline">{evento.titulo}</span>
                          <span className="sm:hidden">{evento.titulo.substring(0, 8)}...</span>
                        </div>
                      );

                      return (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>{pill}</TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {evento.titulo}: {evento.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                    {(eventosDia?.eventos.length ?? 0) > 1 && (
                      <div className="text-xs text-muted-foreground font-medium">
                        <span className="hidden sm:inline">+{(eventosDia?.eventos.length ?? 0) - 1} mais</span>
                        <span className="sm:hidden">+{(eventosDia?.eventos.length ?? 0) - 1}</span>
                      </div>
                    )}
                  </div>

                  {saldo !== 0 && (
                    <div
                      className={cn(
                        "text-xs font-semibold px-1 py-0.5 rounded bg-background/80 mt-1 self-end",
                        saldo > 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {`${saldo > 0 ? "+" : ""}${saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
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
    <Card className="overflow-hidden">
      {/* Header compacto com filtros integrados */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-semibold">Calendário Financeiro</h3>
          <CalendarioFilters filtros={filtros} onChange={setFiltros} />
        </div>
      </div>
      
      <div className="p-1 sm:p-2">
        <Calendar
          mode="single"
          locale={ptBR}
          month={new Date(anoAtual, mesAtual - 1)}
          onDayClick={handleDayClick}
          className="w-full pointer-events-auto"
          classNames={{
            months: "flex w-full",
            month: "space-y-4 w-full",
            caption: "hidden sm:flex justify-center pt-2 pb-4 relative items-center",
            caption_label: "text-lg font-semibold",
            nav: "hidden sm:flex space-x-1 items-center",
            nav_button: "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-muted rounded-md",
            nav_button_previous: "absolute left-4",
            nav_button_next: "absolute right-4",
            table: "w-full border-collapse space-y-1",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground rounded-md w-full font-semibold text-xs sm:text-sm py-1 sm:py-2",
            row: "flex w-full",
            cell: "relative w-full h-10 sm:h-20 text-center text-sm focus-within:relative focus-within:z-20 border border-border/50",
            day: "h-full w-full p-0 font-normal relative flex flex-col",
            day_today: "bg-primary/5",
            day_selected: "bg-primary/10",
            day_outside: "text-muted-foreground opacity-30",
            day_disabled: "text-muted-foreground opacity-20",
          }}
          components={{
            DayContent: ({ date }) => getDayContent(date),
          }}
          showOutsideDays={true}
        />
      </div>

      {selectedDay && (
        <DayDetailsModal
          eventosDia={selectedDay}
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </Card>
  );
};