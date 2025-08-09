import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CreditCard, ShoppingCart, Car, Building } from 'lucide-react';
import type { ContaParcelada } from '@/hooks/useContasParceladas';

interface CardCompromissoProps {
  conta: ContaParcelada;
  onEdit?: (conta: ContaParcelada) => void;
  onDelete?: (id: string) => void;
}

export const CardCompromisso: React.FC<CardCompromissoProps> = ({
  conta,
  onEdit,
  onDelete
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calcularProgresso = () => {
    return (conta.parcelas_pagas / conta.total_parcelas) * 100;
  };

  const calcularParcelasRestantes = () => {
    return conta.total_parcelas - conta.parcelas_pagas;
  };

  const calcularValorRestante = () => {
    return calcularParcelasRestantes() * conta.valor_parcela;
  };

  const calcularDataTermino = () => {
    const dataInicio = new Date(conta.data_primeira_parcela);
    const dataTermino = new Date(dataInicio);
    dataTermino.setMonth(dataTermino.getMonth() + conta.total_parcelas - 1);
    return dataTermino;
  };

  const getIconePorTipo = () => {
    switch (conta.tipo_financiamento) {
      case 'financiamento_veicular':
        return <Car className="h-5 w-5" />;
      case 'emprestimo_pessoal':
        return <Building className="h-5 w-5" />;
      case 'emprestimo_consignado':
        return <Building className="h-5 w-5" />;
      case 'parcelamento':
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getTipoLabel = () => {
    switch (conta.tipo_financiamento) {
      case 'financiamento_veicular':
        return 'Financiamento Veicular';
      case 'emprestimo_pessoal':
        return 'Empréstimo Pessoal';
      case 'emprestimo_consignado':
        return 'Empréstimo Consignado';
      case 'parcelamento':
      default:
        return 'Parcelamento';
    }
  };

  const getCorProgresso = () => {
    const progresso = calcularProgresso();
    if (progresso >= 80) return 'bg-green-500';
    if (progresso >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const isProximoDoFim = () => {
    const parcelasRestantes = calcularParcelasRestantes();
    return parcelasRestantes <= 3;
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-container icon-primary">
              {getIconePorTipo()}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{conta.nome}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {getTipoLabel()}
                </Badge>
                {isProximoDoFim() && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                    Finalizando
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Parcela</div>
            <div className="font-semibold text-foreground">
              {formatCurrency(conta.valor_parcela)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progresso das Parcelas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium text-foreground">
              {conta.parcelas_pagas}/{conta.total_parcelas} parcelas
            </span>
          </div>
          <Progress 
            value={calcularProgresso()} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground">
            {calcularProgresso().toFixed(1)}% concluído
          </div>
        </div>

        {/* Informações Financeiras */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Restam</div>
            <div className="font-semibold text-foreground">
              {calcularParcelasRestantes()} parcelas
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Valor restante</div>
            <div className="font-semibold text-foreground">
              {formatCurrency(calcularValorRestante())}
            </div>
          </div>
        </div>

        {/* Data de Término */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/50">
          <Calendar className="h-4 w-4" />
          <span>
            Termina em {calcularDataTermino().toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
        </div>

        {/* Loja/Instituição */}
        {(conta.loja || conta.instituicao_financeira) && (
          <div className="text-xs text-muted-foreground">
            {conta.loja || conta.instituicao_financeira}
          </div>
        )}

        {/* Ações (aparecem no hover) */}
        <div className="flex gap-2 group-hover-actions">
          <button
            onClick={() => onEdit?.(conta)}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete?.(conta.id)}
            className="text-xs text-destructive hover:text-destructive/80 transition-colors"
          >
            Remover
          </button>
        </div>
      </CardContent>
    </Card>
  );
};