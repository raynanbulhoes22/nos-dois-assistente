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
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <div>
            <h2 className="text-base font-medium text-foreground">Resumo Financeiro</h2>
            <p className="text-xs text-muted-foreground">Dados do mês atual</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleBalance}
            className="gap-1.5 h-7 px-2.5 text-muted-foreground hover:text-foreground border border-border/30 hover:border-border/60"
          >
            {showBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="text-xs">{showBalance ? "Ocultar" : "Mostrar"}</span>
          </Button>
        </div>

        {/* Compact Balance Section */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">Saldo Atual</span>
            <Badge 
              variant={getBalanceVariant()} 
              className="h-4 px-1.5 text-xs"
            >
              {monthlyTrend === 'positive' ? 'Positivo' : 'Negativo'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold tracking-tight ${balance >= 0 ? 'text-success' : 'text-error'}`}>
              {formatCurrency(balance)}
            </span>
            {balance >= 0 ? (
              <div className="p-1 bg-success/10 rounded-full">
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              </div>
            ) : (
              <div className="p-1 bg-error/10 rounded-full">
                <TrendingDown className="h-3.5 w-3.5 text-error" />
              </div>
            )}
          </div>
        </div>

        {/* Compact Income & Expenses */}
        <div className="grid grid-cols-2 gap-0 border-t border-border/30">
          <div className="px-4 py-3 border-r border-border/30">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-0.5">
              Receitas
            </span>
            <p className="text-lg font-semibold text-success">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          
          <div className="px-4 py-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-0.5">
              Despesas
            </span>
            <p className="text-lg font-semibold text-error">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>

        {/* Compact Performance Metrics */}
        <div className="px-4 py-3 bg-muted/20 border-t border-border/30">
          <div className="grid grid-cols-2 gap-4">
            {/* Savings Rate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Taxa de Poupança</span>
                <Badge 
                  variant={getSavingsRateVariant()} 
                  className="h-4 px-1.5 text-xs"
                >
                  {savingsRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    savingsRate >= 20 ? 'bg-success' : savingsRate >= 10 ? 'bg-warning' : 'bg-error'
                  }`}
                  style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                />
              </div>
            </div>
            
            {/* Budget Usage */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Uso do Orçamento</span>
                <Badge 
                  variant={getBudgetUsageVariant()} 
                  className="h-4 px-1.5 text-xs"
                >
                  {budgetUsage.toFixed(1)}%
                </Badge>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetUsage > 90 ? 'bg-error' : budgetUsage > 70 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Compact Financial Alerts */}
        {(balance < 0 || savingsRate < 10 || budgetUsage > 90) && (
          <div className="px-4 py-2.5 bg-warning/5 border-t border-warning/20">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-warning/10 rounded-full mt-0.5">
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-warning mb-1">Alertas Financeiros</h4>
                <div className="space-y-1">
                  {balance < 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-error rounded-full flex-shrink-0"></span>
                      <span>Saldo negativo - Revise seus gastos mensais</span>
                    </p>
                  )}
                  {savingsRate < 10 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-error rounded-full flex-shrink-0"></span>
                      <span>Taxa de poupança baixa - Meta recomendada: 20%</span>
                    </p>
                  )}
                  {budgetUsage > 90 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-warning rounded-full flex-shrink-0"></span>
                      <span>Orçamento quase esgotado - Monitore gastos adicionais</span>
                    </p>
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