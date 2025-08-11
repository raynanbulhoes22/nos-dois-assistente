import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, Activity, Users, Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AdvancedKPI } from "@/hooks/useAdvancedReportsData";

interface AdvancedKPICardsProps {
  kpis: AdvancedKPI;
  isLoading?: boolean;
}

export const AdvancedKPICards = ({ kpis, isLoading }: AdvancedKPICardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, label: 'Excelente' };
    if (score >= 60) return { variant: 'secondary' as const, label: 'Bom' };
    if (score >= 40) return { variant: 'outline' as const, label: 'Regular' };
    return { variant: 'destructive' as const, label: 'Crítico' };
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const healthScoreBadge = getHealthScoreBadge(kpis.financialHealthScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(kpis.totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            Período selecionado
          </p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gastos Totais</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(kpis.totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            Período selecionado
          </p>
        </CardContent>
      </Card>

      {/* Net Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${kpis.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(kpis.netBalance)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={kpis.netBalance >= 0 ? "default" : "destructive"}>
              {kpis.netBalance >= 0 ? "Positivo" : "Negativo"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Savings Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Economia</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpis.savingsRate.toFixed(1)}%
          </div>
          <div className="mt-2">
            <Progress value={Math.min(Math.max(kpis.savingsRate, 0), 100)} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Meta: 20%
          </p>
        </CardContent>
      </Card>

      {/* Monthly Growth Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crescimento Mensal</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${kpis.monthlyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(kpis.monthlyGrowthRate)}
          </div>
          <p className="text-xs text-muted-foreground">
            vs mês anterior
          </p>
        </CardContent>
      </Card>

      {/* Expense Variability */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Variabilidade</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpis.expenseVariability.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Variação dos gastos
          </p>
        </CardContent>
      </Card>

      {/* Transaction Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transações</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpis.transactionCount}
          </div>
          <div className="text-xs text-muted-foreground">
            Ticket médio: {formatCurrency(kpis.avgTransactionValue)}
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Score Financeiro</CardTitle>
          <Repeat className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getHealthScoreColor(kpis.financialHealthScore)}`}>
            {kpis.financialHealthScore.toFixed(0)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={healthScoreBadge.variant}>
              {healthScoreBadge.label}
            </Badge>
          </div>
          <div className="mt-2">
            <Progress value={kpis.financialHealthScore} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};