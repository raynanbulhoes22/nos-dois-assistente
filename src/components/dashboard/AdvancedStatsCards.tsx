import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Target, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAdvancedFinancialStats } from "@/hooks/useAdvancedFinancialStats";

export const AdvancedStatsCards = () => {
  const stats = useAdvancedFinancialStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Comparação Mensal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receitas vs Mês Anterior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.monthlyComparison.currentMonth.income)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.monthlyComparison.growth.income >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${stats.monthlyComparison.growth.income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(stats.monthlyComparison.growth.income)}
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gastos vs Mês Anterior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.monthlyComparison.currentMonth.expenses)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.monthlyComparison.growth.expenses >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-green-600" />
                  )}
                  <span className={`text-sm ${stats.monthlyComparison.growth.expenses >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatPercentage(stats.monthlyComparison.growth.expenses)}
                  </span>
                </div>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transações Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {stats.monthlyComparison.currentMonth.transactionCount}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.monthlyComparison.growth.transactions >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="text-sm text-blue-600">
                    {formatPercentage(stats.monthlyComparison.growth.transactions)}
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Score Saúde Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {stats.performanceMetrics.financialHealthScore.toFixed(0)}
                </p>
                <Badge variant={stats.performanceMetrics.financialHealthScore > 70 ? "default" : "secondary"} className="mt-1">
                  {stats.performanceMetrics.financialHealthScore > 70 ? "Excelente" : "Atenção"}
                </Badge>
              </div>
              <Target className="h-8 w-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights e Alertas */}
      {stats.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Insights Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.insights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20' :
                  insight.type === 'success' ? 'bg-green-50 border-green-400 dark:bg-green-900/20' :
                  'bg-blue-50 border-blue-400 dark:bg-blue-900/20'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                    {insight.action && (
                      <Badge variant="outline" className="ml-2">
                        {insight.action}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};