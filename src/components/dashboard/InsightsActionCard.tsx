import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  ArrowRight,
  Zap,
  PiggyBank,
  CreditCard
} from "lucide-react";
import { useAdvancedFinancialStats } from "@/hooks/useAdvancedFinancialStats";
import { useMemo } from "react";

export interface InsightAction {
  id: string;
  tipo: 'oportunidade' | 'alerta' | 'meta' | 'otimizacao';
  titulo: string;
  descricao: string;
  valor_impacto?: number;
  prioridade: 'alta' | 'media' | 'baixa';
  acao_sugerida: string;
  categoria?: string;
}

export const InsightsActionCard = () => {
  const stats = useAdvancedFinancialStats();
  const isLoading = false;

  const insights = useMemo((): InsightAction[] => {
    if (!stats) return [];

    const insights: InsightAction[] = [];

    // Oportunidade de economia
    if (stats.monthlyComparison.growth.expenses > 10) {
      const crescimentoGastos = stats.monthlyComparison.growth.expenses;
      insights.push({
        id: 'economia_oportunidade',
        tipo: 'oportunidade',
        titulo: 'Oportunidade de Economia',
        descricao: `Suas despesas aumentaram ${crescimentoGastos.toFixed(1)}% em relação ao mês anterior.`,
        valor_impacto: stats.monthlyComparison.currentMonth.expenses - stats.monthlyComparison.previousMonth.expenses,
        prioridade: crescimentoGastos > 20 ? 'alta' : 'media',
        acao_sugerida: 'Revisar gastos das principais categorias'
      });
    }

    // Meta de economia
    const taxaEconomia = stats.monthlyComparison.currentMonth.balance / stats.monthlyComparison.currentMonth.income;
    if (taxaEconomia < 0.1 && stats.monthlyComparison.currentMonth.income > 0) {
      insights.push({
        id: 'meta_economia',
        tipo: 'meta',
        titulo: 'Melhorar Taxa de Economia',
        descricao: `Sua taxa de economia está em ${(taxaEconomia * 100).toFixed(1)}%. Idealmente deveria estar acima de 10%.`,
        prioridade: 'media',
        acao_sugerida: 'Definir metas de economia mensais'
      });
    }

    // Crescimento de receita
    if (stats.monthlyComparison.growth.income > 5) {
      const crescimento = stats.monthlyComparison.currentMonth.income - stats.monthlyComparison.previousMonth.income;
      insights.push({
        id: 'receita_crescimento',
        tipo: 'oportunidade',
        titulo: 'Receita em Crescimento',
        descricao: `Sua receita aumentou ${formatCurrency(crescimento)} este mês. Aproveite para investir!`,
        valor_impacto: crescimento,
        prioridade: 'media',
        acao_sugerida: 'Destinar parte do aumento para investimentos ou reserva'
      });
    }

    // Gastos por categoria
    const categoriaTopGasto = stats.categoryAnalysis?.[0];
    if (categoriaTopGasto && categoriaTopGasto.percentage > 30) {
      insights.push({
        id: 'categoria_concentracao',
        tipo: 'otimizacao',
        titulo: 'Gastos Concentrados',
        descricao: `${categoriaTopGasto.percentage.toFixed(1)}% dos seus gastos estão em "${categoriaTopGasto.name}".`,
        categoria: categoriaTopGasto.name,
        prioridade: 'media',
        acao_sugerida: 'Diversificar gastos ou buscar economia nesta categoria'
      });
    }

    // Saúde financeira
    if (stats.performanceMetrics.financialHealthScore < 30) {
      insights.push({
        id: 'saude_financeira',
        tipo: 'alerta',
        titulo: 'Saúde Financeira Baixa',
        descricao: `Seu score de saúde financeira está em ${stats.performanceMetrics.financialHealthScore.toFixed(0)}%.`,
        prioridade: 'alta',
        acao_sugerida: 'Revisar orçamento e reduzir gastos desnecessários'
      });
    }

    return insights.sort((a, b) => {
      const prioridadeOrder = { alta: 3, media: 2, baixa: 1 };
      return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
    }).slice(0, 4); // Máximo 4 insights
  }, [stats]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getInsightIcon = (tipo: string) => {
    switch (tipo) {
      case 'oportunidade':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'alerta':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'meta':
        return <Target className="h-4 w-4 text-primary" />;
      case 'otimizacao':
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'oportunidade':
        return "default";
      case 'alerta':
        return "destructive";
      case 'meta':
        return "secondary";
      case 'otimizacao':
        return "outline";
      default:
        return "secondary";
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'border-l-destructive';
      case 'media':
        return 'border-l-warning';
      case 'baixa':
        return 'border-l-muted-foreground';
      default:
        return 'border-l-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights e Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-3 border rounded-lg space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights e Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Suas finanças estão equilibradas!</p>
            <p className="text-sm">Continue mantendo o controle dos seus gastos.</p>
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
            <Lightbulb className="h-5 w-5" />
            Insights e Próximos Passos
          </div>
          <Badge variant="outline">{insights.length} insights</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 border-l-4 rounded-lg bg-card hover:bg-muted/5 transition-colors ${getPriorityColor(insight.prioridade)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getInsightIcon(insight.tipo)}
                <h4 className="font-medium text-sm">{insight.titulo}</h4>
              </div>
              <Badge variant={getBadgeVariant(insight.tipo)} className="text-xs">
                {insight.tipo}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {insight.descricao}
            </p>
            
            {insight.valor_impacto && (
              <div className="mb-3 p-2 bg-muted/30 rounded text-sm">
                <span className="font-medium">Impacto potencial: </span>
                <span className={
                  insight.tipo === 'oportunidade' ? 'text-success' : 'text-warning'
                }>
                  {formatCurrency(insight.valor_impacto)}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground flex-1">
                💡 {insight.acao_sugerida}
              </p>
              
              <Button variant="ghost" size="sm" className="ml-2">
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Footer com dica */}
        <div className="pt-4 border-t text-center text-xs text-muted-foreground">
          <span className="flex items-center justify-center gap-1">
            <Zap className="h-3 w-3" />
            Insights atualizados baseados nos seus últimos dados financeiros
          </span>
        </div>
      </CardContent>
    </Card>
  );
};