import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, CreditCard, FileText } from "lucide-react";
import { Movimentacao } from "@/hooks/useMovimentacoes";

interface MovimentacaoCardProps {
  movimentacao: Movimentacao;
}

export const MovimentacaoCard = ({ movimentacao }: MovimentacaoCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{movimentacao.nome}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <CalendarDays className="h-4 w-4" />
              <span>{formatDate(movimentacao.data)}</span>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold text-lg ${
              movimentacao.isEntrada 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {movimentacao.isEntrada ? '+' : '-'} {formatCurrency(movimentacao.valor)}
            </p>
          </div>
        </div>

        {movimentacao.categoria && (
          <div className="mb-2">
            <Badge variant={movimentacao.isEntrada ? "default" : "secondary"}>
              {movimentacao.categoria}
            </Badge>
          </div>
        )}

        <div className="space-y-2 text-sm text-muted-foreground">
          {movimentacao.estabelecimento && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{movimentacao.estabelecimento}</span>
            </div>
          )}

          {movimentacao.forma_pagamento && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>{movimentacao.forma_pagamento}</span>
            </div>
          )}

          {movimentacao.observacao && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5" />
              <span className="italic">{movimentacao.observacao}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};