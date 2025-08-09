import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar,
  CreditCard,
  Building,
  ShoppingCart 
} from 'lucide-react';
import type { PrevisaoMensal } from '@/hooks/usePrevisibilidadeFinanceira';

interface DetalheMensalDialogProps {
  previsao: PrevisaoMensal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getMesNome: (mes: number) => string;
}

export const DetalheMensalDialog: React.FC<DetalheMensalDialogProps> = ({
  previsao,
  open,
  onOpenChange,
  getMesNome
}) => {
  if (!previsao) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: PrevisaoMensal['status']) => {
    switch (status) {
      case 'positivo':
        return 'text-success';
      case 'deficit':
        return 'text-error';
      case 'atencao':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: PrevisaoMensal['status']) => {
    switch (status) {
      case 'positivo':
        return <TrendingUp className="h-5 w-5 text-success" />;
      case 'deficit':
        return <TrendingDown className="h-5 w-5 text-error" />;
      case 'atencao':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: PrevisaoMensal['status']) => {
    switch (status) {
      case 'positivo':
        return 'Saldo Positivo';
      case 'deficit':
        return 'Déficit Projetado';
      case 'atencao':
        return 'Situação de Atenção';
      default:
        return 'Status Indefinido';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'financiamento':
        return <Building className="h-4 w-4" />;
      case 'parcelamento':
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Calendar className="h-5 w-5" />
            Detalhes - {getMesNome(previsao.mes)} {previsao.ano}
          </DialogTitle>
          <DialogDescription>
            Análise detalhada das projeções financeiras para este mês
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Geral */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getStatusIcon(previsao.status)}
                Status Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge 
                  variant={previsao.status === 'deficit' ? 'destructive' : 'secondary'}
                  className={previsao.status === 'positivo' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 
                            previsao.status === 'atencao' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' : ''}
                >
                  {getStatusLabel(previsao.status)}
                </Badge>
                <span className={`text-lg font-bold ${getStatusColor(previsao.status)}`}>
                  {formatCurrency(previsao.saldoProjetado)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">
                    {formatCurrency(previsao.receitas)}
                  </div>
                  <div className="text-sm text-muted-foreground">Receitas</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 dark:bg-red-950/10 rounded-lg">
                  <div className="text-2xl font-bold text-error">
                    {formatCurrency(previsao.gastosFixos)}
                  </div>
                  <div className="text-sm text-muted-foreground">Gastos Fixos</div>
                </div>
                
                <div className={`text-center p-4 rounded-lg ${
                  previsao.saldoProjetado >= 0 
                    ? 'bg-blue-50 dark:bg-blue-950/10' 
                    : 'bg-red-50 dark:bg-red-950/10'
                }`}>
                  <div className={`text-2xl font-bold ${
                    previsao.saldoProjetado >= 0 ? 'text-primary' : 'text-error'
                  }`}>
                    {formatCurrency(previsao.saldoProjetado)}
                  </div>
                  <div className="text-sm text-muted-foreground">Saldo Projetado</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compromissos do Mês */}
          {previsao.compromissos.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Compromissos ({previsao.compromissos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {previsao.compromissos.map((compromisso, index) => (
                    <div key={compromisso.id}>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="icon-container icon-primary">
                            {getTipoIcon(compromisso.tipo)}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {compromisso.nome}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {compromisso.categoria} • Parcela {compromisso.parcela}/{compromisso.totalParcelas}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            {formatCurrency(compromisso.valor)}
                          </div>
                          {compromisso.venceFinal && (
                            <div className="text-xs text-muted-foreground">
                              Termina: {compromisso.venceFinal.toLocaleDateString('pt-BR', { 
                                month: '2-digit', 
                                year: 'numeric' 
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {index < previsao.compromissos.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {previsao.status === 'deficit' && (
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-200">
                      Atenção: Déficit Projetado
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Neste mês, seus gastos fixos superam suas receitas. 
                      Considere revisar seus compromissos ou aumentar sua renda.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {previsao.status === 'atencao' && (
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Margem Apertada
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Seu saldo representa menos de 20% da sua renda. 
                      Monitore seus gastos variáveis com atenção.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};