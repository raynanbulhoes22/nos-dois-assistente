import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, CheckCircle, Lightbulb, X } from 'lucide-react';
import type { AlertaFinanceiro } from '@/hooks/usePrevisibilidadeFinanceira';

interface AlertaFluxoProps {
  alertas: AlertaFinanceiro[];
  onDismiss?: (alertaId: string) => void;
  maxAlertas?: number;
}

export const AlertaFluxo: React.FC<AlertaFluxoProps> = ({
  alertas,
  onDismiss,
  maxAlertas = 5
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getIconePorTipo = (tipo: AlertaFinanceiro['tipo']) => {
    switch (tipo) {
      case 'deficit':
        return <TrendingDown className="h-4 w-4" />;
      case 'termino':
        return <CheckCircle className="h-4 w-4" />;
      case 'economia':
        return <Lightbulb className="h-4 w-4" />;
      case 'oportunidade':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getVariantPorTipo = (tipo: AlertaFinanceiro['tipo']) => {
    switch (tipo) {
      case 'deficit':
        return 'destructive';
      case 'termino':
        return 'default';
      case 'economia':
      case 'oportunidade':
        return 'default';
      default:
        return 'default';
    }
  };

  const getClassePorPrioridade = (prioridade: AlertaFinanceiro['prioridade']) => {
    switch (prioridade) {
      case 'alta':
        return 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/10';
      case 'media':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/10';
      case 'baixa':
        return 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/10';
      default:
        return '';
    }
  };

  const getPrioridadeBadge = (prioridade: AlertaFinanceiro['prioridade']) => {
    switch (prioridade) {
      case 'alta':
        return <Badge variant="destructive" className="text-xs">Alta</Badge>;
      case 'media':
        return <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300">Média</Badge>;
      case 'baixa':
        return <Badge variant="secondary" className="text-xs">Baixa</Badge>;
      default:
        return null;
    }
  };

  const alertasExibidos = alertas.slice(0, maxAlertas);

  if (alertasExibidos.length === 0) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground">Alertas Financeiros</h3>
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 w-fit">
            Tudo em ordem
          </Badge>
        </div>
        
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/10">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200 text-sm sm:text-base">
            Situação Financeira Estável
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300 text-xs sm:text-sm">
            Não há alertas críticos na sua projeção financeira dos próximos 12 meses.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-lg font-semibold text-foreground">Alertas Financeiros</h3>
        <Badge variant="outline" className="text-muted-foreground w-fit">
          {alertas.length} alerta(s)
        </Badge>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {alertasExibidos.map((alerta) => (
          <Alert
            key={alerta.id}
            variant={getVariantPorTipo(alerta.tipo)}
            className={getClassePorPrioridade(alerta.prioridade)}
          >
            <div className="flex items-start justify-between w-full">
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                {getIconePorTipo(alerta.tipo)}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <AlertTitle className="text-sm font-medium truncate">
                      {alerta.titulo}
                    </AlertTitle>
                    {getPrioridadeBadge(alerta.prioridade)}
                  </div>
                  
                  <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
                    {alerta.descricao}
                  </AlertDescription>
                  
                  {alerta.valor && (
                    <div className="text-xs font-medium mt-1 sm:mt-2">
                      Valor: {formatCurrency(alerta.valor)}
                    </div>
                  )}
                </div>
              </div>
              
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alerta.id)}
                  className="opacity-70 hover:opacity-100 transition-opacity p-1 focus-ring rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </Alert>
        ))}
      </div>
      
      {alertas.length > maxAlertas && (
        <div className="text-center">
          <Badge variant="outline" className="text-muted-foreground">
            +{alertas.length - maxAlertas} alertas adicionais
          </Badge>
        </div>
      )}
    </div>
  );
};