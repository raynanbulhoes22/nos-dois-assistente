import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { EyeOff, Eye, Filter } from "lucide-react";

// Hooks for real data
import { useComparativoFinanceiro } from "@/hooks/useComparativoFinanceiro";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useFinancialStats } from "@/hooks/useFinancialStats";

// Dashboard components
import { ConsolidatedKPIs } from "./dashboard/ConsolidatedKPIs";
import { MonthlyComparison } from "./dashboard/MonthlyComparison";
import { SmartInsights } from "./dashboard/SmartInsights";
import { MobileOptimizedTabs } from "./dashboard/MobileOptimizedTabs";
import { AdvancedStatsCards } from "./dashboard/AdvancedStatsCards";
import { DashboardFilters } from "./dashboard/DashboardFilters";
interface User {
  id: string;
  email?: string;
}
export const Dashboard = ({
  user
}: {
  user: User;
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const { toast } = useToast();

  // Calculate date ranges based on selected period
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = now;
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "quarter":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();
  
  // Real data hooks with period filtering
  const currentDate = new Date();
  const currentMonth = selectedPeriod === "month" ? currentDate.getMonth() + 1 : undefined;
  const currentYear = selectedPeriod === "month" ? currentDate.getFullYear() : undefined;
  
  const comparativo = useComparativoFinanceiro(currentMonth, currentYear);
  const { movimentacoes, isLoading: movimentacoesLoading } = useMovimentacoes();
  const financialStats = useFinancialStats();
  const isLoading = movimentacoesLoading || comparativo.isLoading;

  // Helper functions for data generation
  const generateMonthlyData = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      // Filter movimentacoes for this month
      const monthMovs = movimentacoes.filter(mov => {
        const movDate = new Date(mov.data);
        return movDate.getMonth() === date.getMonth() && movDate.getFullYear() === date.getFullYear();
      });
      
      const entradas = monthMovs.filter(mov => mov.isEntrada).reduce((sum, mov) => sum + mov.valor, 0);
      const saidas = monthMovs.filter(mov => !mov.isEntrada).reduce((sum, mov) => sum + mov.valor, 0);
      
      months.push({
        month: monthStr,
        entradas,
        saidas,
        saldo: entradas - saidas
      });
    }
    
    return months;
  };

  const generateProjectionData = () => {
    const months = [];
    const now = new Date();
    const avgIncome = comparativo.comparativo?.rendaRealizada || 0;
    const avgExpenses = comparativo.comparativo?.gastosRealizados || 0;
    
    for (let i = 1; i <= 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthStr = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      months.push({
        month: monthStr,
        entradas: avgIncome * 0.95, // 5% de variação
        saidas: avgExpenses * 1.05, // 5% de aumento
        saldo: (avgIncome * 0.95) - (avgExpenses * 1.05),
        isProjection: true
      });
    }
    
    return months;
  };

  // Filter movimentacoes based on selected period
  const filteredMovimentacoes = useMemo(() => {
    return movimentacoes.filter(mov => {
      const movDate = new Date(mov.data);
      return movDate >= startDate && movDate <= endDate;
    });
  }, [movimentacoes, startDate, endDate]);

  // Memoized calculations with filtered data
  const financialData = useMemo(() => {
    const income = filteredMovimentacoes
      .filter(mov => mov.isEntrada)
      .reduce((sum, mov) => sum + mov.valor, 0);
    
    const expenses = filteredMovimentacoes
      .filter(mov => !mov.isEntrada)
      .reduce((sum, mov) => sum + mov.valor, 0);
    
    const balance = income - expenses;

    // Top categories for the selected period
    const categoryTotals: { [key: string]: number } = {};
    filteredMovimentacoes.filter(mov => !mov.isEntrada).forEach(mov => {
      const category = mov.categoria || 'Sem categoria';
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(mov.valor);
    });
    const topCategories = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value).slice(0, 6);

    // Advanced chart data
    const chartData = {
      categoryData: topCategories,
      monthlyData: generateMonthlyData(),
      projectionData: generateProjectionData(),
      comparativeData: []
    };

    return {
      income,
      expenses,
      balance,
      currentMonthMovs: filteredMovimentacoes,
      topCategories,
      transactionCount: filteredMovimentacoes.length,
      monthlyTrend: balance >= 0 ? 'positive' : 'negative' as 'positive' | 'negative',
      chartData,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
      budgetUsage: expenses > 0 ? (expenses / (income || 1)) * 100 : 0
    };
  }, [filteredMovimentacoes, comparativo.comparativo]);

  const handleRefresh = () => {
    toast({
      title: "Dados atualizados!",
      description: "Dashboard atualizado com sucesso"
    });
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-muted"></div>
          <div className="page-content space-y-6">
            <div className="h-40 bg-muted rounded-lg"></div>
            <div className="metric-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="section-grid">
              <div className="h-80 bg-muted rounded-lg"></div>
              <div className="h-80 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4 sm:px-6">
          {/* Title Section */}
          <div className="mb-3">
            <h1 className="text-2xl sm:text-xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visão geral das suas finanças
            </p>
          </div>

          {/* Mobile Period Toggle */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button 
              variant={selectedPeriod === "week" ? "default" : "outline"} 
              size="sm" 
              className="h-8 px-3 text-xs whitespace-nowrap"
              onClick={() => setSelectedPeriod("week")}
            >
              7 dias
            </Button>
            <Button 
              variant={selectedPeriod === "month" ? "default" : "outline"} 
              size="sm" 
              className="h-8 px-3 text-xs whitespace-nowrap"
              onClick={() => setSelectedPeriod("month")}
            >
              Este mês
            </Button>
            <Button 
              variant={selectedPeriod === "quarter" ? "default" : "outline"} 
              size="sm" 
              className="h-8 px-3 text-xs whitespace-nowrap"
              onClick={() => setSelectedPeriod("quarter")}
            >
              Trimestre
            </Button>
            <Button 
              variant={selectedPeriod === "year" ? "default" : "outline"} 
              size="sm" 
              className="h-8 px-3 text-xs whitespace-nowrap"
              onClick={() => setSelectedPeriod("year")}
            >
              Ano
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-muted-foreground">
              {filteredMovimentacoes.length} transações
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="h-8 px-3 text-xs"
              >
                {showBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span className="ml-1 hidden xs:inline">
                  {showBalance ? "Ocultar" : "Mostrar"}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-3.5 w-3.5" />
                <span className="ml-1 hidden xs:inline">Filtros</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile optimized */}
      <div className="p-4 sm:px-6 pb-6">
        <div className="space-y-8">
          {/* Filters Panel */}
          {showFilters && (
            <DashboardFilters
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              onApplyFilters={(filters) => {
                setAppliedFilters(filters);
                toast({
                  title: "Filtros aplicados!",
                  description: "Os dados foram atualizados conforme os filtros selecionados."
                });
              }}
            />
          )}

          {/* Primary KPIs - Clean Layout */}
          <section>
            <ConsolidatedKPIs
              totalIncome={financialData.income}
              totalExpenses={financialData.expenses}
              balance={financialData.balance}
              initialBalance={financialStats.saldoInicial}
              computedBalance={financialStats.saldoComputado}
              savingsRate={financialData.savingsRate}
              budgetUsage={financialData.budgetUsage}
              monthlyTrend={financialData.monthlyTrend}
              showBalance={showBalance}
              onToggleBalance={() => setShowBalance(!showBalance)}
              isLoading={isLoading}
            />
          </section>

          {/* Secondary Metrics */}
          <section>
            <MonthlyComparison />
          </section>

          {/* Advanced Analytics - Clean Tabs */}
          <section>
            <MobileOptimizedTabs
              user={user}
              chartData={financialData.chartData}
              currentMonthMovs={financialData.currentMonthMovs}
              isLoading={isLoading}
            />
          </section>
        </div>
      </div>
    </div>
  );
};