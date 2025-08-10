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
    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Clean Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-foreground">Resumo Financeiro</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Dados do mês atual
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleBalance}
              className="gap-2 h-8 px-3 text-muted-foreground hover:text-foreground"
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="text-xs">{showBalance ? "Ocultar" : "Mostrar"}</span>
            </Button>
          </div>

          {/* Minimal KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Balance - Main Focus */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Saldo Atual
                </span>
                <Badge variant={getBalanceVariant()} className="text-xs">
                  {monthlyTrend === 'positive' ? 'Positivo' : 'Negativo'}
                </Badge>
              </div>
              <div className="flex items-baseline gap-3">
                <span className={`text-3xl font-bold tracking-tight ${balance >= 0 ? 'text-success' : 'text-error'}`}>
                  {formatCurrency(balance)}
                </span>
                {balance >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-error" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Receitas</p>
                  <p className="text-lg font-semibold text-success">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Despesas</p>
                  <p className="text-lg font-semibold text-error">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Taxa de Poupança</span>
                  <Badge variant={getSavingsRateVariant()} className="text-xs">
                    {savingsRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: `${Math.min(savingsRate, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Uso do Orçamento</span>
                  <Badge variant={getBudgetUsageVariant()} className="text-xs">
                    {budgetUsage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      budgetUsage > 90 ? 'bg-error' : budgetUsage > 70 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                  />
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