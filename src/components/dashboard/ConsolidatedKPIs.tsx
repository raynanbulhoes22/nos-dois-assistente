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
    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
          <div>
            <h2 className="text-base font-semibold text-foreground">Resumo Financeiro</h2>
            <p className="text-xs text-muted-foreground">Dados do mês atual</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleBalance}
            className="gap-1.5 h-8 px-3 text-muted-foreground hover:text-foreground"
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="text-xs">Ocultar</span>
          </Button>
        </div>

        {/* Main Balance Section */}
        <div className="px-4 py-4 text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Saldo</span>
              <Badge variant={getBalanceVariant()} className="h-4 px-2 text-xs">
                {monthlyTrend === 'positive' ? '▲' : '▼'}
              </Badge>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-error'}`}>
                {formatCurrency(balance)}
              </span>
              {balance >= 0 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-error" />
              )}
            </div>
          </div>
        </div>

        {/* Income and Expenses Grid */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Income */}
            <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
              <span className="text-xs text-muted-foreground block mb-1">RECEITAS</span>
              <p className="text-base font-semibold text-success">
                {formatCurrency(totalIncome)}
              </p>
            </div>

            {/* Expenses */}
            <div className="text-center p-3 rounded-lg bg-error/10 border border-error/20">
              <span className="text-xs text-muted-foreground block mb-1">DESPESAS</span>
              <p className="text-base font-semibold text-error">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="px-4 py-3 bg-muted/10 border-t border-border/20">
          <div className="space-y-3">
            {/* Savings Rate */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Taxa</span>
              <span className="text-sm text-muted-foreground">Uso</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Poupança</span>
              <span className="text-sm text-muted-foreground">Orçamento</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Savings Rate Card */}
              <div className="text-center p-2 rounded-lg bg-background border">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="w-12 h-1 bg-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        savingsRate >= 20 ? 'bg-success' : savingsRate >= 10 ? 'bg-warning' : 'bg-error'
                      }`}
                      style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                    />
                  </div>
                </div>
                <Badge variant={getSavingsRateVariant()} className="text-xs">
                  {savingsRate.toFixed(1)}%
                </Badge>
              </div>
              
              {/* Budget Usage Card */}
              <div className="text-center p-2 rounded-lg bg-background border">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="w-12 h-1 bg-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        budgetUsage > 90 ? 'bg-error' : budgetUsage > 70 ? 'bg-warning' : 'bg-success'
                      }`}
                      style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                    />
                  </div>
                </div>
                <Badge variant={getBudgetUsageVariant()} className="text-xs">
                  {budgetUsage.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {(balance < 0 || savingsRate < 10 || budgetUsage > 90) && (
          <div className="px-4 py-3 bg-warning/10 border-t border-warning/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="text-sm text-warning font-medium block">Alertas:</span>
                <div className="space-y-1">
                  {balance < 0 && (
                    <p className="text-xs text-muted-foreground">• Saldo negativo detectado</p>
                  )}
                  {savingsRate < 10 && (
                    <p className="text-xs text-muted-foreground">• Poupança baixa</p>
                  )}
                  {budgetUsage > 90 && (
                    <p className="text-xs text-muted-foreground">• Orçamento esgotado</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};