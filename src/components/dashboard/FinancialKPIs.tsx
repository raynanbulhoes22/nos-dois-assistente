import { TrendingUp, TrendingDown, Eye, EyeOff, DollarSign, Target, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface FinancialKPIsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate?: number;
  budgetUsage?: number;
  monthlyTrend: 'positive' | 'negative' | 'stable';
  isLoading?: boolean;
}

export const FinancialKPIs = ({ 
  totalIncome, 
  totalExpenses, 
  balance, 
  savingsRate = 0,
  budgetUsage = 0,
  monthlyTrend,
  isLoading = false 
}: FinancialKPIsProps) => {
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (value: number) => {
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
    if (budgetUsage <= 95) return "secondary";
    return "destructive";
  };

  if (isLoading) {
    return (
      <Card className="gradient-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Visão Geral Financeira</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowBalance(!showBalance)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Saldo Principal */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Saldo Atual</p>
          <div className="flex items-center justify-center gap-2">
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
              {showBalance ? formatCurrency(balance) : '••••••'}
            </p>
            {balance >= 0 ? 
              <TrendingUp className="h-5 w-5 text-success" /> : 
              <TrendingDown className="h-5 w-5 text-destructive" />
            }
          </div>
          <Badge variant={getBalanceVariant()} className="text-xs">
            {monthlyTrend === 'positive' ? 'Em crescimento' : 
             monthlyTrend === 'negative' ? 'Em declínio' : 'Estável'}
          </Badge>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Receitas */}
          <div className="metric-card-success p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <div className="icon-success">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Receitas</span>
            </div>
            <p className="text-lg font-bold text-success">
              {showBalance ? formatCurrency(totalIncome) : '••••••'}
            </p>
          </div>

          {/* Despesas */}
          <div className="metric-card-error p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <div className="icon-error">
                <TrendingDown className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Despesas</span>
            </div>
            <p className="text-lg font-bold text-destructive">
              {showBalance ? formatCurrency(totalExpenses) : '••••••'}
            </p>
          </div>

          {/* Taxa de Poupança */}
          <div className="metric-card-primary p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <div className="icon-primary">
                <Target className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Taxa Poupança</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-primary">
                {savingsRate.toFixed(1)}%
              </p>
              <Badge variant={getSavingsRateVariant()} className="text-xs">
                {savingsRate >= 20 ? 'Excelente' : savingsRate >= 10 ? 'Boa' : 'Baixa'}
              </Badge>
            </div>
          </div>

          {/* Uso do Orçamento */}
          <div className="metric-card-warning p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <div className="icon-warning">
                <DollarSign className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Orçamento</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-warning">
                {budgetUsage.toFixed(1)}%
              </p>
              <Badge variant={getBudgetUsageVariant()} className="text-xs">
                {budgetUsage <= 80 ? 'Controlado' : budgetUsage <= 95 ? 'Atenção' : 'Limite'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {(balance < 0 || savingsRate < 10 || budgetUsage > 90) && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">Alertas Financeiros</span>
            </div>
            <div className="space-y-1">
              {balance < 0 && (
                <p className="text-xs text-muted-foreground">• Saldo negativo detectado</p>
              )}
              {savingsRate < 10 && (
                <p className="text-xs text-muted-foreground">• Taxa de poupança abaixo do recomendado</p>
              )}
              {budgetUsage > 90 && (
                <p className="text-xs text-muted-foreground">• Orçamento próximo do limite</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};