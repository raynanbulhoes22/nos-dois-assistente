import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Minus
} from "lucide-react";
import { useAdvancedFinancialStats } from "@/hooks/useAdvancedFinancialStats";

export const MonthlyComparison = () => {
  const stats = useAdvancedFinancialStats();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return '0.0%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return <Minus className="h-4 w-4" />;
    if (value > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getGrowthColor = (value: number | undefined, isExpense = false) => {
    if (value === undefined || value === null || isNaN(value) || value === 0) return 'text-neutral';
    
    // Para despesas, crescimento é ruim (vermelho), redução é boa (verde)
    if (isExpense) {
      return value > 0 ? 'text-error' : 'text-success';
    }
    
    // Para receitas, crescimento é bom (verde), redução é ruim (vermelho)
    return value > 0 ? 'text-success' : 'text-error';
  };

  const getBadgeVariant = (value: number | undefined, isExpense = false) => {
    if (value === undefined || value === null || isNaN(value) || value === 0) return 'secondary';
    
    if (isExpense) {
      return value > 0 ? 'destructive' : 'default';
    }
    
    return value > 0 ? 'default' : 'destructive';
  };

  const comparison = stats.monthlyComparison;

  // Add safety check for comparison data
  if (!comparison || !comparison.currentMonth || !comparison.previousMonth || !comparison.growth) {
    return (
      <Card className="card-modern">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Comparativo Mensal</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Carregando dados do comparativo...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Comparativo Mensal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Clean Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Income - Minimal Design */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-success">Receitas</span>
              <div className="flex items-center gap-2">
                <span className={getGrowthColor(comparison.growth.income)}>
                  {getGrowthIcon(comparison.growth.income)}
                </span>
                <Badge variant={getBadgeVariant(comparison.growth.income)} className="text-xs">
                  {formatPercentage(comparison.growth.income)}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Este mês</span>
                <span className="font-medium">
                  {formatCurrency(comparison.currentMonth.income)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Anterior</span>
                <span className="text-muted-foreground">
                  {formatCurrency(comparison.previousMonth.income)}
                </span>
              </div>
            </div>
          </div>

          {/* Expenses Comparison */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-error">Despesas</h4>
            <div className="flex items-center gap-2">
              <span className={getGrowthColor(comparison.growth.expenses, true)}>
                {getGrowthIcon(comparison.growth.expenses)}
              </span>
              <Badge variant={getBadgeVariant(comparison.growth.expenses, true)}>
                {formatPercentage(comparison.growth.expenses)}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Este mês</span>
              <span className="font-semibold">
                {formatCurrency(comparison.currentMonth.expenses)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Mês anterior</span>
              <span className="font-medium">
                {formatCurrency(comparison.previousMonth.expenses)}
              </span>
            </div>
            </div>
          </div>
        </div>

        {/* Balance Comparison */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Saldo</h4>
            <div className="flex items-center gap-2">
              <span className={getGrowthColor(comparison.growth.balance)}>
                {getGrowthIcon(comparison.growth.balance)}
              </span>
              <Badge variant={getBadgeVariant(comparison.growth.balance)}>
                {formatPercentage(comparison.growth.balance)}
              </Badge>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Este mês</p>
              <p className={`text-lg font-bold ${comparison.currentMonth.balance >= 0 ? 'text-success' : 'text-error'}`}>
                {formatCurrency(comparison.currentMonth.balance)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Mês anterior</p>
              <p className={`text-lg font-bold ${comparison.previousMonth.balance >= 0 ? 'text-success' : 'text-error'}`}>
                {formatCurrency(comparison.previousMonth.balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Count Comparison */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Transações</h4>
            <p className="text-sm text-muted-foreground">
              {comparison.currentMonth.transactionCount || 0} este mês
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={getGrowthColor(comparison.growth.transactions)}>
              {getGrowthIcon(comparison.growth.transactions)}
            </span>
            <Badge variant={getBadgeVariant(comparison.growth.transactions)}>
              {formatPercentage(comparison.growth.transactions)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};