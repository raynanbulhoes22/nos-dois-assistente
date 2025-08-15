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
import { useIsMobile } from "@/hooks/use-mobile";

interface ConsolidatedKPIsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  initialBalance?: number;
  computedBalance?: number;
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
  initialBalance = 0,
  computedBalance,
  savingsRate,
  budgetUsage,
  monthlyTrend,
  showBalance,
  onToggleBalance,
  isLoading
}: ConsolidatedKPIsProps) => {
  const isMobile = useIsMobile();
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
      <CardContent className={`p-0 ${isMobile ? 'text-sm' : ''}`}>
        {/* Header - Mobile optimized */}
        <div className={`flex items-center justify-between border-b border-border/20 ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}>
          <div>
            <h2 className={`font-semibold text-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>Resumo Financeiro</h2>
            <p className="text-xs text-muted-foreground">Dados do mês atual</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleBalance}
            className={`gap-1.5 text-muted-foreground hover:text-foreground ${isMobile ? 'h-7 px-2' : 'h-8 px-3'}`}
          >
            {showBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="text-xs hidden xs:inline">Ocultar</span>
          </Button>
        </div>

        {/* Main Balance Section - Mobile optimized */}
        <div className={`text-center ${isMobile ? 'px-3 py-3' : 'px-4 py-4'}`}>
          <div className={`space-y-2 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
            <div className="flex items-center justify-center gap-2">
              <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {computedBalance !== undefined ? 'Saldo Total' : 'Saldo do Mês'}
              </span>
              <Badge variant={getBalanceVariant()} className="h-4 px-2 text-xs">
                {monthlyTrend === 'positive' ? '▲' : '▼'}
              </Badge>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} ${
                (computedBalance !== undefined ? computedBalance : balance) >= 0 ? 'text-success' : 'text-error'
              }`}>
                {formatCurrency(computedBalance !== undefined ? computedBalance : balance)}
              </span>
              {(computedBalance !== undefined ? computedBalance : balance) >= 0 ? (
                <TrendingUp className={`text-success ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              ) : (
                <TrendingDown className={`text-error ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              )}
            </div>
            
            {/* Saldo inicial e evolução - Mostrar sempre que houver saldo inicial */}
            {initialBalance !== undefined && initialBalance !== 0 && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Saldo Inicial: {formatCurrency(initialBalance)}</p>
                {computedBalance !== undefined && (
                  <p>Evolução: <span className={`font-medium ${
                    (computedBalance - initialBalance) >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {(computedBalance - initialBalance) >= 0 ? '+' : ''}{formatCurrency(computedBalance - initialBalance)}
                  </span></p>
                )}
                {computedBalance === undefined && balance !== 0 && (
                  <p>Variação este mês: <span className={`font-medium ${
                    balance >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                  </span></p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Income and Expenses Grid - Mobile optimized */}
        <div className={`${isMobile ? 'px-3 pb-3' : 'px-4 pb-4'}`}>
          <div className={`grid grid-cols-2 ${isMobile ? 'gap-2' : 'gap-4'}`}>
            {/* Income */}
            <div className={`text-center rounded-lg bg-success/10 border border-success/20 ${isMobile ? 'p-2' : 'p-3'}`}>
              <span className="text-xs text-muted-foreground block mb-1">RECEITAS</span>
              <p className={`font-semibold text-success ${isMobile ? 'text-sm' : 'text-base'}`}>
                {formatCurrency(totalIncome)}
              </p>
            </div>

            {/* Expenses */}
            <div className={`text-center rounded-lg bg-error/10 border border-error/20 ${isMobile ? 'p-2' : 'p-3'}`}>
              <span className="text-xs text-muted-foreground block mb-1">DESPESAS</span>
              <p className={`font-semibold text-error ${isMobile ? 'text-sm' : 'text-base'}`}>
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Section - Mobile optimized */}
        <div className={`bg-muted/10 border-t border-border/20 ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}>
          <div className={`space-y-2 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
            {/* Headers */}
            <div className="flex items-center justify-between">
              <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>Taxa</span>
              <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>Uso</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>Poupança</span>
              <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>Orçamento</span>
            </div>
            
            <div className={`grid grid-cols-2 ${isMobile ? 'gap-2' : 'gap-4'}`}>
              {/* Savings Rate Card */}
              <div className={`text-center rounded-lg bg-background border ${isMobile ? 'p-1.5' : 'p-2'}`}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className={`bg-border rounded-full overflow-hidden ${isMobile ? 'w-8 h-1' : 'w-12 h-1'}`}>
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
              <div className={`text-center rounded-lg bg-background border ${isMobile ? 'p-1.5' : 'p-2'}`}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className={`bg-border rounded-full overflow-hidden ${isMobile ? 'w-8 h-1' : 'w-12 h-1'}`}>
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