import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  PiggyBank,
  Calendar,
  ArrowRight
} from "lucide-react";
import { useAdvancedFinancialStats } from "@/hooks/useAdvancedFinancialStats";

export const SmartInsights = () => {
  const stats = useAdvancedFinancialStats();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <TrendingUp className="h-4 w-4" />;
      case 'tip':
        return <Lightbulb className="h-4 w-4" />;
      case 'goal':
        return <Target className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'destructive' as const;
      case 'success':
        return 'default' as const;
      case 'tip':
        return 'secondary' as const;
      case 'goal':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-error';
      case 'success':
        return 'text-success';
      case 'tip':
        return 'text-info';
      case 'goal':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  // Generate smart recommendations based on financial data
  const generateSmartRecommendations = () => {
    const recommendations = [];
    const { monthlyComparison, performanceMetrics, behaviorAnalysis } = stats;

    // Budget optimization
    if (monthlyComparison.growth.expenses > 10) {
      recommendations.push({
        type: 'warning',
        title: 'Gastos em Alta',
        description: `Suas despesas aumentaram ${monthlyComparison.growth.expenses.toFixed(1)}% este mês. Revise categorias com maior crescimento.`,
        action: 'Analisar Categorias'
      });
    }

    // Savings opportunity
    if (performanceMetrics.financialHealthScore < 70) {
      recommendations.push({
        type: 'tip',
        title: 'Oportunidade de Economia',
        description: 'Identifique gastos desnecessários para melhorar sua saúde financeira.',
        action: 'Ver Sugestões'
      });
    }

    // Positive trends
    if (monthlyComparison.growth.income > 5) {
      recommendations.push({
        type: 'success',
        title: 'Receita Crescendo',
        description: `Excelente! Sua receita aumentou ${monthlyComparison.growth.income.toFixed(1)}% este mês.`,
        action: 'Otimizar Investimentos'
      });
    }

    // Behavioral insights
    if (behaviorAnalysis.topEstablishments.length > 0) {
      const topSpending = behaviorAnalysis.topEstablishments[0];
      recommendations.push({
        type: 'goal',
        title: 'Padrão de Gastos',
        description: `Você gastou mais em ${topSpending.name}. Considere definir um limite para esta categoria.`,
        action: 'Definir Meta'
      });
    }

    // Default insights if no specific patterns
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'tip',
        title: 'Mantenha o Controle',
        description: 'Continue monitorando seus gastos regularmente para manter a saúde financeira.',
        action: 'Ver Relatórios'
      });
    }

    return recommendations.slice(0, 4); // Limit to 4 insights
  };

  const smartRecommendations = generateSmartRecommendations();

  return (
    <Card className="card-modern">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          <CardTitle className="text-lg">Insights Inteligentes</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {smartRecommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <PiggyBank className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Adicione mais transações para receber insights personalizados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {smartRecommendations.map((insight, index) => (
              <div 
                key={index}
                className="p-4 border border-border/50 rounded-lg hover:shadow-md transition-all duration-200 hover:border-border"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    insight.type === 'warning' ? 'bg-error/10' :
                    insight.type === 'success' ? 'bg-success/10' :
                    insight.type === 'tip' ? 'bg-info/10' :
                    'bg-warning/10'
                  }`}>
                    <span className={getInsightColor(insight.type)}>
                      {getInsightIcon(insight.type)}
                    </span>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={getInsightBadgeVariant(insight.type)}>
                        {insight.type === 'warning' ? 'Atenção' :
                         insight.type === 'success' ? 'Sucesso' :
                         insight.type === 'tip' ? 'Dica' : 'Meta'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto text-primary hover:text-primary/80"
                    >
                      {insight.action}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Planejar Mês
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Target className="h-4 w-4" />
              Definir Metas
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};