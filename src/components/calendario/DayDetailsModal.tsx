import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EventosDia, EventoFinanceiro } from "./tipos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Wallet, Calendar, CreditCard, TrendingUp } from "lucide-react";

interface DayDetailsModalProps {
  eventosDia: EventosDia;
  isOpen: boolean;
  onClose: () => void;
}

export const DayDetailsModal = ({ eventosDia, isOpen, onClose }: DayDetailsModalProps) => {
  const formatCurrency = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getEventIcon = (tipo: EventoFinanceiro['tipo']) => {
    switch (tipo) {
      case 'movimentacao':
        return Wallet;
      case 'parcela':
        return Calendar;
      case 'vencimento-cartao':
        return CreditCard;
      case 'renda':
        return TrendingUp;
      default:
        return Wallet;
    }
  };

  const getEventBadgeVariant = (evento: EventoFinanceiro) => {
    if (evento.isEntrada) return "default";
    
    switch (evento.tipo) {
      case 'parcela':
        return "secondary";
      case 'vencimento-cartao':
        return "destructive";
      default:
        return "outline";
    }
  };

  const getEventTypeLabel = (tipo: EventoFinanceiro['tipo']) => {
    switch (tipo) {
      case 'movimentacao':
        return 'Movimentação';
      case 'parcela':
        return 'Parcela';
      case 'vencimento-cartao':
        return 'Vencimento Cartão';
      case 'renda':
        return 'Renda';
      default:
        return tipo;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {format(eventosDia.data, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo do Dia */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Entradas</div>
              <div className="font-semibold text-success">
                {formatCurrency(eventosDia.totalEntradas)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Saídas</div>
              <div className="font-semibold text-destructive">
                {formatCurrency(eventosDia.totalSaidas)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Saldo</div>
              <div className={`font-semibold ${
                eventosDia.saldo >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {formatCurrency(eventosDia.saldo)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Lista de Eventos */}
          <div className="space-y-3">
            <h4 className="font-semibold">Eventos do Dia ({eventosDia.eventos.length})</h4>
            
            {eventosDia.eventos.map((evento) => {
              const Icon = getEventIcon(evento.tipo);
              
              return (
                <div
                  key={evento.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium truncate">{evento.titulo}</h5>
                      <Badge variant={getEventBadgeVariant(evento)} className="text-xs">
                        {getEventTypeLabel(evento.tipo)}
                      </Badge>
                    </div>
                    
                    {evento.categoria && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {evento.categoria}
                      </p>
                    )}
                    
                    {evento.detalhes?.observacao && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {evento.detalhes.observacao}
                      </p>
                    )}
                    
                    {evento.detalhes?.estabelecimento && (
                      <p className="text-sm text-muted-foreground mb-1">
                        📍 {evento.detalhes.estabelecimento}
                      </p>
                    )}
                    
                    {evento.detalhes?.numeroParcela && evento.detalhes?.totalParcelas && (
                      <p className="text-sm text-muted-foreground mb-1">
                        Parcela {evento.detalhes.numeroParcela} de {evento.detalhes.totalParcelas}
                      </p>
                    )}
                    
                    {evento.detalhes?.numeroCartao && (
                      <p className="text-sm text-muted-foreground mb-1">
                        Final {evento.detalhes.numeroCartao}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className={`font-semibold ${
                      evento.isEntrada ? 'text-success' : 'text-destructive'
                    }`}>
                      {evento.isEntrada ? '+' : '-'}{formatCurrency(Math.abs(evento.valor))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};