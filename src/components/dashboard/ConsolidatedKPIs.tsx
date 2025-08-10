import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  PiggyBank,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ConsolidatedKPIsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  budgetUsage: number;
  monthlyTrend: 'positive' | 'negative';
  showBalance: boolean;
  onToggleBalance: () => void;
  isLoading?: boolean;
}

export const ConsolidatedKPIs = ({
  totalIncome,
  totalExpenses,
  balance,
  savingsRate,
  budgetUsage,
  monthlyTrend,
  showBalance,
  onToggleBalance,
  isLoading
}: ConsolidatedKPIsProps) => {
  const formatCurrency = (value: number) => {
    if (!showBalance) return "••••••";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getBalanceVariant = () => {
    if (balance >= 0) return "default";
    return "destructive";
  };

  const getSavingsRateVariant = () => {
    if (savingsRate >= 20) return "default";
    if (savingsRate >= 10) return "secondary";
    return "destructive";
  };

  const getBudgetUsageVariant = () => {
    if (budgetUsage <= 80) return "default";
    if (budgetUsage <= 100) return "secondary";
    return "destructive";
  };

  if (isLoading) {
    return (
      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-9 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-modern">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="icon-container icon-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Visão Geral Financeira</h2>
                <p className="text-sm text-muted-foreground">
                  Resumo do mês atual
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleBalance}
              className="gap-2"
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showBalance ? "Ocultar" : "Mostrar"}
            </Button>
          </div>

          {/* Main KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Balance */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {balance >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-error" />
                )}
                <span className="text-sm font-medium text-muted-foreground">
                  Saldo Atual
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-error'}`}>
                  {formatCurrency(balance)}
                </span>
                <Badge variant={getBalanceVariant()}>
                  {monthlyTrend === 'positive' ? 'Positivo' : 'Negativo'}
                </Badge>
              </div>
            </div>

            {/* Income vs Expenses */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-success">Receitas</span>
                  <span className="text-sm font-semibold text-success">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-error">Despesas</span>
                  <span className="text-sm font-semibold text-error">
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-accent" />
                    <span className="text-sm text-muted-foreground">Taxa de Poupança</span>
                  </div>
                  <Badge variant={getSavingsRateVariant()}>
                    {savingsRate.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-warning" />
                    <span className="text-sm text-muted-foreground">Uso do Orçamento</span>
                  </div>
                  <Badge variant={getBudgetUsageVariant()}>
                    {budgetUsage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Alerts */}
          {(balance < 0 || savingsRate < 10 || budgetUsage > 90) && (
            <div className="p-4 bg-warning-muted border border-warning/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-warning">Alertas Financeiros</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {balance < 0 && (
                      <p>• Saldo negativo - Revise seus gastos mensais</p>
                    )}
                    {savingsRate < 10 && (
                      <p>• Taxa de poupança baixa - Meta recomendada: 20%</p>
                    )}
                    {budgetUsage > 90 && (
                      <p>• Orçamento quase esgotado - Monitore gastos adicionais</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};