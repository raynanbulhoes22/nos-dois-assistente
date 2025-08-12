import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign
} from "lucide-react";
import { useComparativoFinanceiro } from "@/hooks/useComparativoFinanceiro";
import { useMemo } from "react";

export const ProjecaoMensalCard = () => {
  const { comparativo, isLoading } = useComparativoFinanceiro();

  const projecao = useMemo(() => {
    const hoje = new Date();
    const diasPassados = hoje.getDate();
    const totalDiasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    const percentualMes = diasPassados / totalDiasMes;

    const receitaProjetada = comparativo.rendaRealizada / percentualMes;
    const despesaProjetada = comparativo.gastosRealizados / percentualMes;
    const saldoProjetado = receitaProjetada - despesaProjetada;

    const tendenciaReceita = receitaProjetada > comparativo.rendaProjetada ? 'alta' : 'baixa';
    const tendenciaDespesa = despesaProjetada > comparativo.gastosProjetados ? 'alta' : 'baixa';

    return {
      receita: {
        projetada: receitaProjetada,
        meta: comparativo.rendaProjetada,
        tendencia: tendenciaReceita,
        percentual: (receitaProjetada / comparativo.rendaProjetada) * 100
      },
      despesa: {
        projetada: despesaProjetada,
        meta: comparativo.gastosProjetados,
        tendencia: tendenciaDespesa,
        percentual: (despesaProjetada / comparativo.gastosProjetados) * 100
      },
      saldo: {
        projetado: saldoProjetado,
        meta: comparativo.saldoProjetado,
        percentual: diasPassados / totalDiasMes * 100
      },
      diasRestantes: totalDiasMes - diasPassados,
      percentualMes
    };
  }, [comparativo]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getVariantByTrend = (percentual: number) => {
    if (percentual >= 100) return "default";
    if (percentual >= 80) return "secondary";
    return "destructive";
  };

  const getTrendIcon = (tendencia: string, tipo: 'receita' | 'despesa') => {
    const isPositive = (tipo === 'receita' && tendencia === 'alta') || 
                      (tipo === 'despesa' && tendencia === 'baixa');
    
    return isPositive ? (
      <TrendingUp className="h-4 w-4 text-success" />
    ) : (
      <TrendingDown className="h-4 w-4 text-destructive" />
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Visão do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-2 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Visão do Mês
          </div>
          <Badge variant="outline">
            {Math.round(projecao.percentualMes * 100)}% concluído
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Saldo Projetado */}
        <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Saldo Projetado para o Final do Mês</p>
          <div className="flex items-center justify-center gap-2">
            <DollarSign className="h-5 w-5" />
            <span className={`text-xl font-bold ${
              projecao.saldo.projetado >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {formatCurrency(projecao.saldo.projetado)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Meta: {formatCurrency(projecao.saldo.meta)}
          </p>
        </div>

        {/* Receitas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-success" />
              <span className="font-medium text-sm">Receitas</span>
              {getTrendIcon(projecao.receita.tendencia, 'receita')}
            </div>
            <Badge variant={getVariantByTrend(projecao.receita.percentual)}>
              {Math.round(projecao.receita.percentual)}%
            </Badge>
          </div>
          
          <Progress 
            value={Math.min(projecao.receita.percentual, 100)} 
            className="h-2"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Projetado: {formatCurrency(projecao.receita.projetada)}</span>
            <span>Meta: {formatCurrency(projecao.receita.meta)}</span>
          </div>
        </div>

        {/* Despesas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-destructive" />
              <span className="font-medium text-sm">Despesas</span>
              {getTrendIcon(projecao.despesa.tendencia, 'despesa')}
            </div>
            <Badge variant={
              projecao.despesa.percentual <= 100 ? "default" : "destructive"
            }>
              {Math.round(projecao.despesa.percentual)}%
            </Badge>
          </div>
          
          <Progress 
            value={Math.min(projecao.despesa.percentual, 100)} 
            className="h-2"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Projetado: {formatCurrency(projecao.despesa.projetada)}</span>
            <span>Orçamento: {formatCurrency(projecao.despesa.meta)}</span>
          </div>
        </div>

        {/* Insights */}
        <div className="pt-4 border-t space-y-3">
          <h4 className="font-medium text-sm">Insights</h4>
          
          {projecao.receita.percentual < 80 && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-xs text-warning">
                ⚠️ Receitas abaixo da meta. Considere buscar fontes adicionais.
              </p>
            </div>
          )}
          
          {projecao.despesa.percentual > 100 && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-xs text-destructive">
                🚨 Gastos excedem o orçamento. Revise suas despesas.
              </p>
            </div>
          )}
          
          {projecao.saldo.projetado > projecao.saldo.meta && (
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-xs text-success">
                ✅ Ótimo ritmo! Você está economizando mais que o planejado.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          {projecao.diasRestantes} dias restantes no mês
        </div>
      </CardContent>
    </Card>
  );
};