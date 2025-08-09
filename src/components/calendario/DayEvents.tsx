import { EventoFinanceiro } from "./tipos";
import { Badge } from "@/components/ui/badge";
import { Wallet, Calendar, CreditCard, TrendingUp } from "lucide-react";

interface DayEventsProps {
  eventos: EventoFinanceiro[];
  isToday?: boolean;
  className?: string;
}

export const DayEvents = ({ eventos, isToday, className }: DayEventsProps) => {
  if (eventos.length === 0) {
    return null;
  }

  const getEventIcon = (tipo: EventoFinanceiro['tipo']) => {
    switch (tipo) {
      case 'parcela':
        return Calendar;
      case 'vencimento-cartao':
        return CreditCard;
      case 'renda':
        return TrendingUp;
      default:
        return Calendar;
    }
  };

  const getEventColor = (evento: EventoFinanceiro) => {
    if (evento.isEntrada) {
      return "bg-success/20 text-success-foreground border-success/40";
    }
    
    switch (evento.tipo) {
      case 'parcela':
        return "bg-warning/20 text-warning-foreground border-warning/40";
      case 'vencimento-cartao':
        return "bg-destructive/20 text-destructive-foreground border-destructive/40";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Mostrar apenas os primeiros 3 eventos + contador se houver mais
  const eventosVisiveis = eventos.slice(0, 3);
  const eventosExtras = eventos.length - 3;

  return (
    <div className={`flex flex-col gap-1 mt-1 ${className}`}>
      {eventosVisiveis.map((evento) => {
        const Icon = getEventIcon(evento.tipo);
        
        return (
          <div
            key={evento.id}
            className={`
              flex items-center gap-1 px-2 py-1 rounded text-xs border
              ${getEventColor(evento)}
              ${isToday ? 'ring-1 ring-primary/50' : ''}
              transition-all duration-200 hover:scale-105 hover:shadow-sm
            `}
          >
            <Icon className="h-3 w-3 flex-shrink-0" />
            <span className="truncate flex-1" title={evento.titulo}>
              {evento.titulo}
            </span>
            <span className="font-medium">
              {evento.isEntrada ? '+' : '-'}
              {evento.valor.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        );
      })}
      
      {eventosExtras > 0 && (
        <Badge 
          variant="outline" 
          className="text-xs py-0 px-1 self-start bg-background/80"
        >
          +{eventosExtras} mais
        </Badge>
      )}
    </div>
  );
};