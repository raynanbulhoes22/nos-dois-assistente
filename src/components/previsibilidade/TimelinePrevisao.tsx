import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type { PrevisaoMensal } from '@/hooks/usePrevisibilidadeFinanceira';

interface TimelinePrevisaoProps {
  previsoes: PrevisaoMensal[];
  getMesNome: (mes: number) => string;
  onMesClick?: (previsao: PrevisaoMensal) => void;
}

export const TimelinePrevisao: React.FC<TimelinePrevisaoProps> = ({
  previsoes,
  getMesNome,
  onMesClick
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: PrevisaoMensal['status']) => {
    switch (status) {
      case 'positivo':
        return 'bg-success-muted border-green-200 text-success';
      case 'deficit':
        return 'bg-error-muted border-red-200 text-error';
      case 'atencao':
        return 'bg-warning-muted border-yellow-200 text-warning';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  const getStatusIcon = (status: PrevisaoMensal['status']) => {
    switch (status) {
      case 'positivo':
        return <TrendingUp className="h-4 w-4" />;
      case 'deficit':
        return <TrendingDown className="h-4 w-4" />;
      case 'atencao':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: PrevisaoMensal['status']) => {
    switch (status) {
      case 'positivo':
        return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">Positivo</Badge>;
      case 'deficit':
        return <Badge variant="destructive">Déficit</Badge>;
      case 'atencao':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300">Atenção</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Projeção dos Próximos 12 Meses</h3>
        <Badge variant="outline" className="text-muted-foreground">
          Timeline Financeira
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {previsoes.map((previsao, index) => (
          <Card
            key={`${previsao.mes}-${previsao.ano}`}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${getStatusColor(previsao.status)}`}
            onClick={() => onMesClick?.(previsao)}
          >
            <div className="space-y-3">
              {/* Header do Mês */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(previsao.status)}
                  <h4 className="font-medium">
                    {getMesNome(previsao.mes)} {previsao.ano}
                  </h4>
                </div>
                {getStatusBadge(previsao.status)}
              </div>

              {/* Métricas Principais */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receitas:</span>
                  <span className="font-medium text-success">
                    {formatCurrency(previsao.receitas)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gastos Fixos:</span>
                  <span className="font-medium text-expense">
                    {formatCurrency(previsao.gastosFixos)}
                  </span>
                </div>
                
                <div className="pt-1 border-t border-border/50">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saldo:</span>
                    <span className={`font-semibold ${
                      previsao.saldoProjetado >= 0 ? 'text-success' : 'text-error'
                    }`}>
                      {formatCurrency(previsao.saldoProjetado)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Compromissos Preview */}
              {previsao.compromissos.length > 0 && (
                <div className="pt-2 border-t border-border/30">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{previsao.compromissos.length} compromisso(s)</span>
                    <span>Ver detalhes →</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Saldo Positivo</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Atenção (menos de 20% da renda)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Déficit Projetado</span>
        </div>
      </div>
    </div>
  );
};